package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.CourseUnitResponse;
import org.nexus.napbackend.facade.CourseUnitFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/course-units")
public class CourseUnitController {

    private final CourseUnitFacade facade;

    public CourseUnitController(CourseUnitFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<CourseUnitResponse>> find(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) Integer year) {
        if (courseId != null && semester != null && year != null) {
            return ResponseEntity.ok(facade.findByCourseIdAndSemesterAndYear(courseId, semester, year));
        }
        if (courseId != null) {
            return ResponseEntity.ok(facade.findByCourseId(courseId));
        }
        return ResponseEntity.ok(List.of());
    }
}
