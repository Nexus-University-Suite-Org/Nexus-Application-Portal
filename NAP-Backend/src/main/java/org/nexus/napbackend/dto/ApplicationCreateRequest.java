package org.nexus.napbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ApplicationCreateRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @Size(max = 100) String otherNames,
        @NotBlank @Email @Size(max = 320) String email,
        @Size(max = 20) String phoneNumber,
        @Size(max = 20) String gender,
        @Size(max = 200) String nationality,
        @Size(max = 200) String district,
        @Size(max = 200) String subcounty,
        @Size(max = 200) String village,
        @Size(max = 200) String programChoice1,
        @Size(max = 200) String programChoice2,
        @Size(max = 200) String programChoice3,
        @Size(max = 50) String studyMode,
        @Size(max = 20) String academicYear,
        @Size(max = 20) String semester,
        String uceResult,
        String uaceResult,
        String documents,
        String extras,
        BigDecimal feePaid,
        BigDecimal feeRequired,
        String feeCurrency
) {
}
