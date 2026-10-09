package org.nexus.napbackend.configuration;

import java.util.Arrays;
import java.util.List;
import org.nexus.napbackend.service.TenantService;
import org.nexus.napbackend.tenancy.TenantFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsProperties corsProperties;
    private final TenantService tenantService;
    private final TenancyProperties tenancyProperties;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          CorsProperties corsProperties,
                          TenantService tenantService,
                          TenancyProperties tenancyProperties) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsProperties = corsProperties;
        this.tenantService = tenantService;
        this.tenancyProperties = tenancyProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/admin/auth/login").permitAll()
                        .requestMatchers("/api/v1/applications/**").permitAll()
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
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/platform/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/v1/chat/status", "/api/v1/chat/sources", "/api/v1/chat/train").hasRole("ADMIN")
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // Resolve the tenant before authentication so the JWT can then pin a
                // university admin to their own tenant.
                .addFilterBefore(new TenantFilter(tenantService, tenancyProperties), JwtAuthFilter.class);

        return http.build();
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
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
