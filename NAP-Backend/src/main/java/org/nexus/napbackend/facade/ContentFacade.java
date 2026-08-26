package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import org.nexus.napbackend.service.ContentService;
import org.springframework.stereotype.Component;

@Component
public class ContentFacade {

    private final ContentService service;

    public ContentFacade(ContentService service) {
        this.service = service;
    }

    @Transactional
    public List<Map<String, Object>> getCollection(String collection) {
        return service.findByCollection(collection);
    }
}
