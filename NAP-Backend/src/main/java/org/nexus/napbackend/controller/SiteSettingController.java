package org.nexus.napbackend.controller;

import java.util.Map;
import org.nexus.napbackend.facade.SiteSettingFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/content/site-settings")
public class SiteSettingController {

    private final SiteSettingFacade facade;

    public SiteSettingController(SiteSettingFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getSiteSettings() {
        return ResponseEntity.ok(facade.findAllAsMap());
    }
}
