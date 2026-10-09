package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Tenancy resolution settings.
 *
 * @param baseDomain        apex host used for subdomain routing, e.g. {@code portal.example.com}.
 *                          A request to {@code muk.portal.example.com} resolves tenant {@code muk}.
 * @param defaultTenantCode tenant used when a request carries no {@code X-Tenant} and the
 *                          host has no tenant mapping. Null falls back to the demo tenant.
 * @param internalToken     shared secret that lets trusted service-to-service callers (the
 *                          ML service) select a tenant with {@code X-Tenant}. The header is
 *                          ignored for ordinary requests so a public client cannot read
 *                          another university's content by guessing its code. Empty disables
 *                          header-based resolution entirely.
 */
@ConfigurationProperties(prefix = "nap.tenancy")
public record TenancyProperties(String baseDomain, String defaultTenantCode, String internalToken) {

    public String baseDomain() {
        return baseDomain == null ? "" : baseDomain.trim().toLowerCase();
    }

    public String defaultTenantCode() {
        return defaultTenantCode == null ? "" : defaultTenantCode.trim();
    }

    public String internalToken() {
        return internalToken == null ? "" : internalToken.trim();
    }
}
