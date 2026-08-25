package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.StudentFee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {

    List<StudentFee> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<StudentFee> findByStudentIdAndStatusOrderByDueDateAsc(Long studentId, String status);
}
