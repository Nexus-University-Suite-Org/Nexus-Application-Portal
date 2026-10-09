package org.nexus.napbackend.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Tenant;
import org.nexus.napbackend.service.TenantService;
import org.nexus.napbackend.tenancy.TenantContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TenantService tenantService;

    public JwtAuthFilter(JwtUtil jwtUtil, TenantService tenantService) {
        this.jwtUtil = jwtUtil;
        this.tenantService = tenantService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.isValid(token)) {
                Long adminId = jwtUtil.getAdminId(token);
                String email = jwtUtil.getEmail(token);
                String role = jwtUtil.getRole(token);
                Long tenantId = jwtUtil.getTenantId(token);

                if ("SUPER_ADMIN".equals(role)) {
                    authenticate(adminId, email, role, tenantId);

                    // The platform super-admin may act across tenants by naming one
                    // with X-Tenant; without it the host-resolved tenant stands.
                    String ref = request.getHeader("X-Tenant");
                    if (ref != null && !ref.isBlank()) {
                        tenantService.resolve(ref).ifPresent(tenant ->
                                TenantContext.set(tenant.getId(), tenant.getCode()));
                    }
                } else if (tenantId != null) {
                    // A university admin is pinned to their own tenant regardless of
                    // any X-Tenant header. A deleted or disabled university means the
                    // token is no longer honored: the request continues unauthenticated
                    // so security rules reject it.
                    Optional<Tenant> tenant = tenantService.findById(tenantId);
                    if (tenant.isPresent() && Boolean.TRUE.equals(tenant.get().getActive())) {
                        authenticate(adminId, email, role, tenantId);
                        TenantContext.set(tenantId, tenant.get().getCode());
                    } else {
                        SecurityContextHolder.clearContext();
                    }
                } else {
                    authenticate(adminId, email, role, tenantId);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private void authenticate(Long adminId, String email, String role, Long tenantId) {
        AdminPrincipal principal = new AdminPrincipal(adminId, email, role, tenantId);
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    public record AdminPrincipal(Long id, String email, String role, Long tenantId) {
    }
}
