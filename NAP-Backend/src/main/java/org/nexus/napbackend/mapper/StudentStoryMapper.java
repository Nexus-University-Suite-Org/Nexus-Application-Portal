package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.StudentStoryRequest;
import org.nexus.napbackend.dto.StudentStoryResponse;
import org.nexus.napbackend.model.StudentStory;

public final class StudentStoryMapper {

    private StudentStoryMapper() {}

    public static StudentStory toEntity(StudentStoryRequest request) {
        StudentStory entity = new StudentStory();
        entity.setTitle(request.title());
        entity.setContent(request.content());
        entity.setStudentName(request.studentName());
        entity.setAuthor(request.author());
        entity.setProgram(request.program());
        entity.setGraduationYear(request.graduationYear());
        entity.setImageUrl(request.imageUrl());
        entity.setFeatured(request.featured() != null ? request.featured() : false);
        return entity;
    }

    public static StudentStoryResponse toDto(StudentStory entity) {
        return new StudentStoryResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getSlug(),
                entity.getContent(),
                entity.getStudentName(),
                entity.getAuthor(),
                entity.getProgram(),
                entity.getGraduationYear(),
                entity.getImageUrl(),
                entity.getFeatured(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(StudentStory entity, StudentStoryRequest request) {
        entity.setTitle(request.title());
        entity.setContent(request.content());
        entity.setStudentName(request.studentName());
        entity.setAuthor(request.author());
        entity.setProgram(request.program());
        entity.setGraduationYear(request.graduationYear());
        entity.setImageUrl(request.imageUrl());
        entity.setFeatured(request.featured() != null ? request.featured() : entity.getFeatured());
    }
}
