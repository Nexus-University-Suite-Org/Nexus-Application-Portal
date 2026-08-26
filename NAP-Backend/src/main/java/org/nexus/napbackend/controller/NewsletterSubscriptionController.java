package org.nexus.napbackend.controller;

import org.nexus.napbackend.dto.NewsletterSubscribeRequest;
import org.nexus.napbackend.dto.NewsletterSubscribeResponse;
import org.nexus.napbackend.facade.NewsletterSubscriptionFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/newsletter")
public class NewsletterSubscriptionController {

    private final NewsletterSubscriptionFacade facade;

    public NewsletterSubscriptionController(NewsletterSubscriptionFacade facade) {
        this.facade = facade;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<NewsletterSubscribeResponse> subscribe(
            @RequestBody NewsletterSubscribeRequest request) {
        return ResponseEntity.ok(facade.subscribe(request));
    }
}
