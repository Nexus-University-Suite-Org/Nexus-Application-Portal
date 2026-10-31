package org.nexus.napbackend.configuration;

import java.util.List;

/**
 * Role vocabulary shared with Nexus Identity.
 *
 * <p>Kept in one place because the same list gates both the HTTP rules and the
 * transitional login endpoint. If they drifted, an applicant could get a
 * "successful" login response containing a token every admin route rejects.
 */
public final class NexusRoles {

    /** Roles allowed into the admissions back office. */
    public static final List<String> ADMIN = List.of(
            "ADMISSIONS_OFFICER",
            "ADMISSIONS_ADMIN",
            "SYSTEM_ADMIN",
            "ADMIN",
            "SUPER_ADMIN");

    private NexusRoles() {
    }
}
