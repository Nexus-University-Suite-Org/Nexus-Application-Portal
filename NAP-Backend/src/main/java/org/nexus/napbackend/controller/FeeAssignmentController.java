package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.FeeAssignmentRequest;
import org.nexus.napbackend.dto.FeeAssignmentResponse;
import org.nexus.napbackend.facade.FeeAssignmentFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fees")
public class FeeAssignmentController {

    private final FeeAssignmentFacade facade;

    public FeeAssignmentController(FeeAssignmentFacade facade) {
        this.facade = facade;
    }

    @PostMapping
    public ResponseEntity<FeeAssignmentResponse> create(@Valid @RequestBody FeeAssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeeAssignmentResponse> update(@PathVariable Long id,
                                                        @Valid @RequestBody FeeAssignmentRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeeAssignmentResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<FeeAssignmentResponse>> findAll(
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String academicYear) {
        if (college != null) {
            return ResponseEntity.ok(facade.findByCollege(college));
        }
        if (academicYear != null) {
            return ResponseEntity.ok(facade.findByAcademicYear(academicYear));
        }
        return ResponseEntity.ok(facade.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
