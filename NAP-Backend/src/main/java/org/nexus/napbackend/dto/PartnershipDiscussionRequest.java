package org.nexus.napbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PartnershipDiscussionRequest(
        @NotBlank @Size(max = 200) String organization_name,
        @NotBlank @Email @Size(max = 320) String contact_email,
        @Size(max = 20) String contact_phone,
        @Size(max = 200) String contact_person,
        @NotBlank @Size(max = 10000) String message
) {
}
