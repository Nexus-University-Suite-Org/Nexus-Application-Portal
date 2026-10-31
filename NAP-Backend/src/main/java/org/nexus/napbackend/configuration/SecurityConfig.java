package org.nexus.napbackend.configuration;

import java.util.Arrays;
import java.util.List;
import org.nexus.napbackend.service.TenantService;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.nexus.napbackend.tenancy.TenantFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * NAP is an OAuth2 resource server.
 *
 * <p>It no longer mints its own tokens: access tokens come from Nexus Identity,
 * are signed with RS256 and are verified locally against the published JWKS.
 * The {@code roles} claim is mapped to {@code ROLE_*} authorities, so the same
 * role names are meaningful in every portal.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsProperties corsProperties;
    private final IdentityProperties identityProperties;
    private final TenantService tenantService;
    private final TenancyProperties tenancyProperties;

    public SecurityConfig(CorsProperties corsProperties,
                          IdentityProperties identityProperties,
                          TenantService tenantService,
                          TenancyProperties tenancyProperties) {
        this.corsProperties = corsProperties;
        this.identityProperties = identityProperties;
        this.tenantService = tenantService;
        this.tenancyProperties = tenancyProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationConverter jwtAuthenticationConverter)
            throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Transitional shim: the app portal still posts to this endpoint
                        // until its frontend moves to the identity redirect flow.
                        .requestMatchers("/api/v1/admin/auth/login").permitAll()
                        .requestMatchers("/api/v1/admin/**")
                        .hasAnyRole(NexusRoles.ADMIN.toArray(String[]::new))
                        .requestMatchers("/api/v1/platform/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/v1/chat/status", "/api/v1/chat/sources", "/api/v1/chat/train")
                        .hasAnyRole(NexusRoles.ADMIN.toArray(String[]::new))
                        .requestMatchers("/api/v1/applications/**").permitAll()
                        .requestMatchers("/api/v1/auth/student/me").hasAnyRole("STUDENT", "APPLICANT")
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/contact/**").permitAll()
                        .requestMatchers("/api/v1/partnership-discussions/**").permitAll()
                        .requestMatchers("/api/v1/storage/**").permitAll()
                        .requestMatchers("/api/enrollments/**").permitAll()
                        .requestMatchers("/api/courses/**").permitAll()
                        .requestMatchers("/api/course-units/**").permitAll()
                        .requestMatchers("/api/v1/health/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/programs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/schemes/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/chat", "/api/v1/chat/").permitAll()
                        .requestMatchers("/api/v1/programs/**", "/api/v1/schemes/**")
                        .hasAnyRole(NexusRoles.ADMIN.toArray(String[]::new))
                        .anyRequest().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)))
                .addFilterBefore(
                        new TenantFilter(tenantService, tenancyProperties),
                        BearerTokenAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(identityProperties.jwkSetUri())
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                .build();
        // Issuer and expiry come from the shared defaults; audience and token
        // type are NAP-specific hardening.
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<Jwt>(
                JwtValidators.createDefaultWithIssuer(identityProperties.issuer()),
                new NexusAccessTokenValidator(identityProperties.audiences())));
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        // Use the human-readable email as the principal name rather than the
        // opaque UUID in `sub`, so logs and audit entries stay useful.
        converter.setPrincipalClaimName("email");
        return converter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(corsProperties.allowedOrigins().split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
