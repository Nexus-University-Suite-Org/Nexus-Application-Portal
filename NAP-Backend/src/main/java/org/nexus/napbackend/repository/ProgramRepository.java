package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProgramRepository extends JpaRepository<Program, Long> {

    List<Program> findByDeletedAtIsNullOrderByDisplayOrderAscProgramNameAsc();

    List<Program> findByTenantIdAndDeletedAtIsNullOrderByDisplayOrderAscProgramNameAsc(Long tenantId);

    Optional<Program> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT p FROM Program p WHERE p.deletedAt IS NULL AND (LOWER(p.programName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.programCode) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Program> search(@Param("q") String query);

    @Query("SELECT p FROM Program p WHERE p.tenantId = :tenantId AND p.deletedAt IS NULL AND (LOWER(p.programName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.programCode) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Program> searchByTenant(@Param("tenantId") Long tenantId, @Param("q") String query);

    List<Program> findByDeletedAtIsNullAndStatusOrderByProgramNameAsc(String status);

    List<Program> findByTenantIdAndDeletedAtIsNullAndStatusOrderByProgramNameAsc(Long tenantId, String status);

    List<Program> findByDeletedAtIsNullAndProgramTypeOrderByProgramNameAsc(String programType);

    List<Program> findByTenantIdAndDeletedAtIsNullAndProgramTypeOrderByProgramNameAsc(Long tenantId, String programType);

    boolean existsByProgramCodeAndDeletedAtIsNull(String programCode);

    boolean existsByTenantIdAndProgramCodeAndDeletedAtIsNull(Long tenantId, String programCode);

    Optional<Program> findByProgramNameIgnoreCaseAndDeletedAtIsNull(String programName);

    Optional<Program> findByTenantIdAndProgramNameIgnoreCaseAndDeletedAtIsNull(Long tenantId, String programName);

    Optional<Program> findByProgramCodeIgnoreCaseAndDeletedAtIsNull(String programCode);

    Optional<Program> findByTenantIdAndProgramCodeIgnoreCaseAndDeletedAtIsNull(Long tenantId, String programCode);

    List<Program> findAllByTenantId(Long tenantId);
}
