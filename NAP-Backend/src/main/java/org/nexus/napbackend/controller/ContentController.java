package org.nexus.napbackend.controller;

import java.util.List;
import java.util.Map;
import org.nexus.napbackend.facade.ContentFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/content")
public class ContentController {

    private final ContentFacade facade;

    public ContentController(ContentFacade facade) {
        this.facade = facade;
    }

    @GetMapping("/{collection}")
    public ResponseEntity<List<Map<String, Object>>> getCollection(
            @PathVariable String collection) {
        return ResponseEntity.ok(facade.getCollection(collection));
    }
}
