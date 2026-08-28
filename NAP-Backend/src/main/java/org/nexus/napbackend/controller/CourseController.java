package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.CourseResponse;
import org.nexus.napbackend.facade.CourseFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseFacade facade;

    public CourseController(CourseFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> find(
            @RequestParam(required = false) String name) {
        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(facade.findByName(name));
        }
        return ResponseEntity.ok(facade.findAll());
    }
}
