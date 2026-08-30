package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.SiteSettingRequest;
import org.nexus.napbackend.dto.SiteSettingResponse;
import org.nexus.napbackend.facade.SiteSettingFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/site-settings")
public class AdminSiteSettingController {

    private final SiteSettingFacade facade;

    public AdminSiteSettingController(SiteSettingFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<SiteSettingResponse>> list() {
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{key}")
    public ResponseEntity<SiteSettingResponse> getByKey(@RequestParam String key) {
        return ResponseEntity.ok(facade.findByKey(key));
    }

    @PutMapping
    public ResponseEntity<SiteSettingResponse> upsert(@Valid @RequestBody SiteSettingRequest request) {
        return ResponseEntity.ok(facade.upsert(request));
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@RequestParam String key) {
        facade.delete(key);
        return ResponseEntity.noContent().build();
    }
}
