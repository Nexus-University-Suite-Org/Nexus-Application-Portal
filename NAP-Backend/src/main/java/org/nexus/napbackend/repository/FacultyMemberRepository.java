package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.FacultyMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyMemberRepository extends JpaRepository<FacultyMember, Long> {

    List<FacultyMember> findAllByOrderByDisplayOrderAsc();
}
