package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.ProgramCategoryResponse;
import org.nexus.napbackend.dto.ProgramResponse;
import org.nexus.napbackend.facade.ProgramCategoryFacade;
import org.nexus.napbackend.facade.ProgramFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/programs")
public class PublicProgramController {

    private final ProgramFacade programFacade;
    private final ProgramCategoryFacade categoryFacade;

    public PublicProgramController(ProgramFacade programFacade, ProgramCategoryFacade categoryFacade) {
        this.programFacade = programFacade;
        this.categoryFacade = categoryFacade;
    }

    @GetMapping
    public ResponseEntity<List<ProgramResponse>> list() {
        return ResponseEntity.ok(programFacade.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ProgramCategoryResponse>> categories() {
        return ResponseEntity.ok(categoryFacade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(programFacade.findById(id));
    }
}
