package org.nexus.napbackend.tenancy;

/**
 * Per-request tenant holder.
 *
 * <p>The resolved tenant is stored in a {@link ThreadLocal} so the many existing
 * services can scope their reads and writes without every constructor having to
 * thread an extra argument through. A servlet filter populates it at the start of
 * each request and clears it afterwards; callers that run outside a request (the
 * scheduler, tests) fall back to {@link #DEFAULT_TENANT_ID}.
 */
public final class TenantContext {

    /** Tenant that owns the pre-existing demo data. */
    public static final Long DEFAULT_TENANT_ID = 1L;

    private static final ThreadLocal<Long> CURRENT_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_CODE = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void set(Long tenantId, String tenantCode) {
        CURRENT_ID.set(tenantId);
        CURRENT_CODE.set(tenantCode);
    }

    /** Returns the request tenant, or the default when none was resolved. */
    public static Long getCurrentTenantId() {
        Long id = CURRENT_ID.get();
        return id != null ? id : DEFAULT_TENANT_ID;
    }

    /** Returns the request tenant, or {@code null} when none was resolved. */
    public static Long getOptionalTenantId() {
        return CURRENT_ID.get();
    }

    public static String getOptionalTenantCode() {
        return CURRENT_CODE.get();
    }

    /**
     * A stable reference for the current tenant to forward to downstream services
     * (the ML service accepts either a code or an id via {@code X-Tenant}). Prefers
     * the code so per-tenant indexes can be namespaced by it.
     */
    public static String currentRef() {
        String code = CURRENT_CODE.get();
        if (code != null && !code.isBlank()) {
            return code;
        }
        return String.valueOf(getCurrentTenantId());
    }

    public static void clear() {
        CURRENT_ID.remove();
        CURRENT_CODE.remove();
    }
}
