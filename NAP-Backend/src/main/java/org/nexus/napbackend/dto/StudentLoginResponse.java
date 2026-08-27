package org.nexus.napbackend.dto;

public record StudentLoginResponse(
        String token,
        StudentUser user,
        StudentProfile profile
) {

    public record StudentUser(
            Long id,
            String email,
            String fullName,
            String role
    ) {
    }

    public record StudentProfile(
            Long applicationId,
            String prn,
            String fullName,
            String email,
            String phoneNumber,
            String programChoice1,
            String programChoice2,
            String programChoice3,
            String programChoice4,
            String assignedProgramme,
            String status,
            String studyMode,
            String academicYear,
            String startDate
    ) {
    }
}
