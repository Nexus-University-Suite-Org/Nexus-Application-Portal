package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.function.Function;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentNumberService {

    private static final String REGISTRATION_PREFIX = "REG-";
    private static final String STUDENT_PREFIX = "STU-";
    private static final int MAX_SEQUENCE = 9999;

    private final ApplicationRepository applicationRepository;

    public StudentNumberService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public void assignIfAbsent(Application application) {
        int year = LocalDateTime.now().getYear();
        if (isBlank(application.getRegistrationNumber())) {
            application.setRegistrationNumber(
                    nextSequence(year, REGISTRATION_PREFIX, Application::getRegistrationNumber));
        }
        if (isBlank(application.getStudentNumber())) {
            application.setStudentNumber(
                    nextSequence(year, STUDENT_PREFIX, Application::getStudentNumber));
        }
    }

    private String nextSequence(int year, String kind, Function<Application, String> reader) {
        String prefix = kind + year + "-";
        int highest = applicationRepository.findAll().stream()
                .map(reader)
                .filter(value -> value != null && value.startsWith(prefix))
                .map(value -> value.substring(prefix.length()))
                .filter(value -> value.matches("\\d{4}"))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0);
        if (highest >= MAX_SEQUENCE) {
            throw new IllegalStateException("Student number sequence " + prefix + "is exhausted");
        }
        return String.format("%s%04d", prefix, highest + 1);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
