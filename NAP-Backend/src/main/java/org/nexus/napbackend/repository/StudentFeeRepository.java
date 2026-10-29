package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.StudentFee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {

    List<StudentFee> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<StudentFee> findByStudentIdAndStatusOrderByDueDateAsc(Long studentId, String status);

    List<StudentFee> findByTenantIdAndStudentIdOrderByCreatedAtDesc(Long tenantId, Long studentId);

    List<StudentFee> findByTenantIdAndStudentIdAndStatusOrderByDueDateAsc(
            Long tenantId, Long studentId, String status);

    Optional<StudentFee> findByIdAndTenantId(Long id, Long tenantId);
}
