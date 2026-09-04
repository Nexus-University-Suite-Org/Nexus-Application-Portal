package org.nexus.napbackend.configuration;

import org.nexus.napbackend.repository.CourseRepository;
import org.nexus.napbackend.repository.CourseUnitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentDataSeeder.class);

    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;

    public EnrollmentDataSeeder(CourseRepository courseRepository, CourseUnitRepository courseUnitRepository) {
        this.courseRepository = courseRepository;
        this.courseUnitRepository = courseUnitRepository;
    }

    @Override
    public void run(String... args) {
        log.info("EnrollmentDataSeeder — no seed data configured");
    }
}
