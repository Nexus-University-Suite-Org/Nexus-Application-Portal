package org.nexus.napbackend.facade;

import java.util.List;
import org.nexus.napbackend.dto.CourseUnitResponse;
import org.nexus.napbackend.mapper.CourseUnitMapper;
import org.nexus.napbackend.service.CourseUnitService;
import org.springframework.stereotype.Component;

@Component
public class CourseUnitFacade {

    private final CourseUnitService service;

    public CourseUnitFacade(CourseUnitService service) {
        this.service = service;
    }

    public List<CourseUnitResponse> findByCourseId(Long courseId) {
        return service.findByCourseId(courseId).stream()
                .map(CourseUnitMapper::toDto)
                .toList();
    }

    public List<CourseUnitResponse> findByCourseIdAndSemesterAndYear(Long courseId, Integer semester, Integer year) {
        return service.findByCourseIdAndSemesterAndYear(courseId, semester, year).stream()
                .map(CourseUnitMapper::toDto)
                .toList();
    }
}
