package org.nexus.napbackend.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
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

                AdminPrincipal principal = new AdminPrincipal(adminId, email, role, tenantId);
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

                // A university admin is pinned to their own tenant regardless of any
                // X-Tenant header. Only the platform super-admin may act across tenants.
                if (tenantId != null && !"SUPER_ADMIN".equals(role)) {
                    String code = tenantService.findById(tenantId)
                            .map(tenant -> tenant.getCode())
                            .orElse(null);
                    TenantContext.set(tenantId, code);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    public record AdminPrincipal(Long id, String email, String role, Long tenantId) {
    }
}
