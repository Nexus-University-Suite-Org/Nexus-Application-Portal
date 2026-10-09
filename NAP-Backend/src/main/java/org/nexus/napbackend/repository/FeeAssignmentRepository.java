package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.FeeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeeAssignmentRepository extends JpaRepository<FeeAssignment, Long> {

    List<FeeAssignment> findAllByOrderByAcademicYearDescYearLevelAscSemesterAsc();

    List<FeeAssignment> findByCollegeOrderByAcademicYearDescYearLevelAscSemesterAsc(String college);

    List<FeeAssignment> findByAcademicYearOrderByYearLevelAscSemesterAsc(String academicYear);

    @Query("SELECT f FROM FeeAssignment f WHERE f.academicYear = :academicYear ORDER BY f.college, f.category, f.yearLevel, f.semester")
    List<FeeAssignment> findByAcademicYearForReport(@Param("academicYear") String academicYear);

    @Query("SELECT f FROM FeeAssignment f ORDER BY f.academicYear DESC, f.college, f.category, f.yearLevel, f.semester")
    List<FeeAssignment> findAllForReport();

    List<FeeAssignment> findByTenantIdOrderByAcademicYearDescYearLevelAscSemesterAsc(Long tenantId);

    List<FeeAssignment> findByTenantIdAndCollegeOrderByAcademicYearDescYearLevelAscSemesterAsc(
            Long tenantId, String college);

    List<FeeAssignment> findByTenantIdAndAcademicYearOrderByYearLevelAscSemesterAsc(
            Long tenantId, String academicYear);

    Optional<FeeAssignment> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT f FROM FeeAssignment f WHERE f.tenantId = :tenantId AND f.academicYear = :academicYear ORDER BY f.college, f.category, f.yearLevel, f.semester")
    List<FeeAssignment> findByTenantIdAndAcademicYearForReport(
            @Param("tenantId") Long tenantId, @Param("academicYear") String academicYear);

    @Query("SELECT f FROM FeeAssignment f WHERE f.tenantId = :tenantId ORDER BY f.academicYear DESC, f.college, f.category, f.yearLevel, f.semester")
    List<FeeAssignment> findAllByTenantIdForReport(@Param("tenantId") Long tenantId);
}
