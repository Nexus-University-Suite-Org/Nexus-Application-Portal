package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.ProgramCategoryProgram;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramCategoryProgramRepository extends JpaRepository<ProgramCategoryProgram, Long> {

    List<ProgramCategoryProgram> findByCategoryId(Long categoryId);

    List<ProgramCategoryProgram> findByProgramId(Long programId);

    boolean existsByCategoryIdAndProgramId(Long categoryId, Long programId);

    void deleteByCategoryIdAndProgramId(Long categoryId, Long programId);
}
