package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.nexus.napbackend.dto.StudentFeeRequest;
import org.nexus.napbackend.dto.StudentFeeResponse;
import org.nexus.napbackend.facade.StudentFeeFacade;
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
@RequestMapping("/api/v1/student-fees")
public class StudentFeeController {

    private final StudentFeeFacade facade;

    public StudentFeeController(StudentFeeFacade facade) {
        this.facade = facade;
    }

    @PostMapping
    public ResponseEntity<StudentFeeResponse> create(@Valid @RequestBody StudentFeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentFeeResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody StudentFeeRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<StudentFeeResponse> recordPayment(@PathVariable Long id,
                                                            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(facade.recordPayment(id, amount));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentFeeResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<StudentFeeResponse>> findByStudentId(
            @RequestParam Long studentId,
            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(facade.findByStudentIdAndStatus(studentId, status));
        }
        return ResponseEntity.ok(facade.findByStudentId(studentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
