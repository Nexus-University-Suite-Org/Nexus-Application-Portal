package org.nexus.napbackend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByPrn(String prn);

    Optional<Application> findByRegistrationNumber(String registrationNumber);

    Optional<Application> findByStudentNumber(String studentNumber);

    List<Application> findByEmailOrderByCreatedAtDesc(String email);

    List<Application> findByStatusOrderByCreatedAtDesc(String status);

    List<Application> findByReviewStatusOrderByCreatedAtDesc(String reviewStatus);

    boolean existsByPrn(String prn);

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByStudentNumber(String studentNumber);

    long countByStatus(String status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Application a WHERE a.status = :status AND " +
           "(LOWER(a.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.prn) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Application> findByStatusAndSearch(@Param("status") String status,
                                           @Param("search") String search,
                                           Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.status = :status")
    Page<Application> findByStatusPaged(@Param("status") String status, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE " +
           "LOWER(a.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.prn) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Application> findBySearch(@Param("search") String search, Pageable pageable);
}
