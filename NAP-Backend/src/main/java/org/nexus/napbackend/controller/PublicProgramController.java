package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.ProgramResponse;
import org.nexus.napbackend.facade.ProgramFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/programs")
public class PublicProgramController {

    private final ProgramFacade facade;

    public PublicProgramController(ProgramFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<ProgramResponse>> list() {
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }
}
