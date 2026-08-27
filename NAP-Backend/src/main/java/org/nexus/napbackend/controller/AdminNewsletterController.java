package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.NewsletterSubscriptionResponse;
import org.nexus.napbackend.facade.NewsletterSubscriptionAdminFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/newsletter")
public class AdminNewsletterController {

    private final NewsletterSubscriptionAdminFacade facade;

    public AdminNewsletterController(NewsletterSubscriptionAdminFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<NewsletterSubscriptionResponse>> list() {
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsletterSubscriptionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
