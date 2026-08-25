package org.nexus.napbackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.nexus.napbackend.configuration.ContactRateLimitFilter;
import org.nexus.napbackend.dto.ContactRequest;
import org.nexus.napbackend.dto.ContactResponse;
import org.nexus.napbackend.service.ContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping({"/api/v1/contact", "/api/v1/contact/"})
    public ResponseEntity<ContactResponse> submit(@Valid @RequestBody ContactRequest request,
                                                  HttpServletRequest httpRequest) {
        return respond(request, httpRequest);
    }

    @PostMapping({"/api/contact", "/api/contact/"})
    public ResponseEntity<ContactResponse> submitLegacy(@Valid @RequestBody ContactRequest request,
                                                        HttpServletRequest httpRequest) {
        return respond(request, httpRequest);
    }

    private ResponseEntity<ContactResponse> respond(ContactRequest request, HttpServletRequest httpRequest) {
        ContactResponse response = contactService.register(request, ContactRateLimitFilter.clientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
