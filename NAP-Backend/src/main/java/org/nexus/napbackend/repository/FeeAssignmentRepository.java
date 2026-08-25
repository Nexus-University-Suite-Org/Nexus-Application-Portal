package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.FeeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeAssignmentRepository extends JpaRepository<FeeAssignment, Long> {

    List<FeeAssignment> findAllByOrderByAcademicYearDescYearLevelAscSemesterAsc();

    List<FeeAssignment> findByCollegeOrderByAcademicYearDescYearLevelAscSemesterAsc(String college);

    List<FeeAssignment> findByAcademicYearOrderByYearLevelAscSemesterAsc(String academicYear);
}
