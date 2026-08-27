package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.FacultyMemberRequest;
import org.nexus.napbackend.dto.FacultyMemberResponse;
import org.nexus.napbackend.model.FacultyMember;

public final class FacultyMemberMapper {

    private FacultyMemberMapper() {}

    public static FacultyMember toEntity(FacultyMemberRequest request) {
        FacultyMember entity = new FacultyMember();
        entity.setName(request.name());
        entity.setTitle(request.title());
        entity.setDepartment(request.department());
        entity.setBio(request.bio());
        entity.setEmail(request.email());
        entity.setSpecialization(request.specialization());
        entity.setDisplayOrder(request.displayOrder());
        return entity;
    }

    public static FacultyMemberResponse toDto(FacultyMember entity) {
        return new FacultyMemberResponse(
                entity.getId(),
                entity.getName(),
                entity.getTitle(),
                entity.getDepartment(),
                entity.getBio(),
                entity.getEmail(),
                entity.getSpecialization(),
                entity.getDisplayOrder(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(FacultyMember entity, FacultyMemberRequest request) {
        entity.setName(request.name());
        entity.setTitle(request.title());
        entity.setDepartment(request.department());
        entity.setBio(request.bio());
        entity.setEmail(request.email());
        entity.setSpecialization(request.specialization());
        entity.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : entity.getDisplayOrder());
    }
}
