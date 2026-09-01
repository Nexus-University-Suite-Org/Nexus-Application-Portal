package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.ProgramCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramCategoryRepository extends JpaRepository<ProgramCategory, Long> {

    List<ProgramCategory> findAllByOrderByDisplayOrderAscNameAsc();

    boolean existsByNameIgnoreCase(String name);
}
