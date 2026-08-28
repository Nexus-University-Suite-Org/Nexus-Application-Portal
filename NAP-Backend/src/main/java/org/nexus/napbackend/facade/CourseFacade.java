package org.nexus.napbackend.facade;

import java.util.List;
import org.nexus.napbackend.dto.CourseResponse;
import org.nexus.napbackend.mapper.CourseMapper;
import org.nexus.napbackend.service.CourseService;
import org.springframework.stereotype.Component;

@Component
public class CourseFacade {

    private final CourseService service;

    public CourseFacade(CourseService service) {
        this.service = service;
    }

    public List<CourseResponse> findAll() {
        return service.findAll().stream()
                .map(CourseMapper::toDto)
                .toList();
    }

    public List<CourseResponse> findByName(String name) {
        return service.findByName(name)
                .map(c -> List.of(CourseMapper.toDto(c)))
                .orElse(List.of());
    }
}
