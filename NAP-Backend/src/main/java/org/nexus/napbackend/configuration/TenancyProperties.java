package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Tenancy resolution settings.
 *
 * @param baseDomain        apex host used for subdomain routing, e.g. {@code portal.example.com}.
 *                          A request to {@code muk.portal.example.com} resolves tenant {@code muk}.
 * @param defaultTenantCode tenant used when a request carries no {@code X-Tenant} and the
 *                          host has no tenant mapping. Null falls back to the demo tenant.
 */
@ConfigurationProperties(prefix = "nap.tenancy")
public record TenancyProperties(String baseDomain, String defaultTenantCode) {

    public String baseDomain() {
        return baseDomain == null ? "" : baseDomain.trim().toLowerCase();
    }

    public String defaultTenantCode() {
        return defaultTenantCode == null ? "" : defaultTenantCode.trim();
    }
}
