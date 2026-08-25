package org.nexus.napbackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.nexus.napbackend.dto.PartnershipDiscussionRequest;
import org.nexus.napbackend.dto.PartnershipDiscussionResponse;
import org.nexus.napbackend.service.PartnershipDiscussionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PartnershipDiscussionController {

    private final PartnershipDiscussionService service;

    public PartnershipDiscussionController(PartnershipDiscussionService service) {
        this.service = service;
    }

    @PostMapping({"/api/v1/partnership-discussions", "/api/v1/partnership-discussions/"})
    public ResponseEntity<PartnershipDiscussionResponse> submit(
            @Valid @RequestBody PartnershipDiscussionRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        PartnershipDiscussionResponse response = service.submit(request, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
