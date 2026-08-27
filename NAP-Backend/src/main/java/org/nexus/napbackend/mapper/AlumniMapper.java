package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.AlumniRequest;
import org.nexus.napbackend.dto.AlumniResponse;
import org.nexus.napbackend.model.Alumni;

public final class AlumniMapper {

    private AlumniMapper() {}

    public static Alumni toEntity(AlumniRequest request) {
        Alumni entity = new Alumni();
        entity.setName(request.name());
        entity.setProgram(request.program());
        entity.setGraduationYear(request.graduationYear());
        entity.setBio(request.bio());
        entity.setImageUrl(request.imageUrl());
        return entity;
    }

    public static AlumniResponse toDto(Alumni entity) {
        return new AlumniResponse(
                entity.getId(),
                entity.getName(),
                entity.getProgram(),
                entity.getGraduationYear(),
                entity.getBio(),
                entity.getImageUrl(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(Alumni entity, AlumniRequest request) {
        entity.setName(request.name());
        entity.setProgram(request.program());
        entity.setGraduationYear(request.graduationYear());
        entity.setBio(request.bio());
        entity.setImageUrl(request.imageUrl());
    }
}
