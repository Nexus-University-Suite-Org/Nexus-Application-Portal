package org.nexus.napbackend.tenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.nexus.napbackend.configuration.TenancyProperties;
import org.nexus.napbackend.model.Tenant;
import org.nexus.napbackend.service.TenantService;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Resolves the tenant for each request and exposes it through {@link TenantContext}.
 *
 * <p>Resolution order:
 * <ol>
 *   <li>{@code X-Tenant} header (numeric id or code) — used by the ML service and
 *       any API client that knows which university it is acting for.</li>
 *   <li>An exact custom domain configured on a tenant.</li>
 *   <li>A subdomain of the configured base domain
 *       ({@code muk}.portal.example.com → code {@code muk}).</li>
 *   <li>The configured default tenant code.</li>
 *   <li>No tenant — callers fall back to {@link TenantContext#DEFAULT_TENANT_ID}.</li>
 * </ol>
 *
 * <p>The context is always cleared afterwards so a thread reused by the pool
 * cannot leak one tenant's identity into the next request.
 */
public class TenantFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Tenant";

    private final TenantService tenantService;
    private final TenancyProperties properties;

    public TenantFilter(TenantService tenantService, TenancyProperties properties) {
        this.tenantService = tenantService;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            resolve(request).ifPresent(tenant ->
                    TenantContext.set(tenant.getId(), tenant.getCode()));
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private Optional<Tenant> resolve(HttpServletRequest request) {
        Optional<Tenant> byHeader = tenantService.resolve(request.getHeader(HEADER));
        if (byHeader.isPresent()) {
            return byHeader;
        }

        String serverName = request.getServerName();

        Optional<Tenant> byCustomDomain = tenantService.findByDomain(serverName);
        if (byCustomDomain.isPresent()) {
            return byCustomDomain;
        }

        String baseDomain = properties.baseDomain();
        if (!baseDomain.isEmpty() && serverName != null) {
            String host = serverName.toLowerCase();
            if (host.endsWith("." + baseDomain)) {
                String sub = host.substring(0, host.length() - baseDomain.length() - 1);
                if (!sub.isBlank() && !sub.contains(".") && !"www".equals(sub)) {
                    Optional<Tenant> bySubdomain = tenantService.resolve(sub);
                    if (bySubdomain.isPresent()) {
                        return bySubdomain;
                    }
                }
            }
        }

        return tenantService.resolve(properties.defaultTenantCode());
    }
}
