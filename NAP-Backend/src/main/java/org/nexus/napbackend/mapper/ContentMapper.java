package org.nexus.napbackend.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import org.nexus.napbackend.model.Alumni;
import org.nexus.napbackend.model.CmsEvent;
import org.nexus.napbackend.model.CourseCatalog;
import org.nexus.napbackend.model.FacultyMember;
import org.nexus.napbackend.model.Faq;
import org.nexus.napbackend.model.GalleryItem;
import org.nexus.napbackend.model.LegalPage;
import org.nexus.napbackend.model.NewsArticle;
import org.nexus.napbackend.model.NewsletterSubscription;
import org.nexus.napbackend.model.PageSection;
import org.nexus.napbackend.model.Partner;
import org.nexus.napbackend.model.QuickLink;
import org.nexus.napbackend.model.Scholarship;
import org.nexus.napbackend.model.StudentStory;

public final class ContentMapper {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private ContentMapper() {
    }

    public static Map<String, Object> toMap(Object entity) {
        @SuppressWarnings("unchecked")
        Map<String, Object> map = MAPPER.convertValue(entity, Map.class);
        map.remove("tenantId");
        map.remove("createdAt");
        return map;
    }
}
