package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.FaqRequest;
import org.nexus.napbackend.dto.FaqResponse;
import org.nexus.napbackend.model.Faq;

public final class FaqMapper {

    private FaqMapper() {}

    public static Faq toEntity(FaqRequest request) {
        Faq entity = new Faq();
        entity.setCategory(request.category());
        entity.setQuestion(request.question());
        entity.setAnswer(request.answer());
        entity.setDisplayOrder(request.displayOrder());
        return entity;
    }

    public static FaqResponse toDto(Faq entity) {
        return new FaqResponse(
                entity.getId(),
                entity.getCategory(),
                entity.getQuestion(),
                entity.getAnswer(),
                entity.getDisplayOrder(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(Faq entity, FaqRequest request) {
        entity.setCategory(request.category());
        entity.setQuestion(request.question());
        entity.setAnswer(request.answer());
        entity.setDisplayOrder(request.displayOrder());
    }
}
