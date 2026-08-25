package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByPrn(String prn);

    List<Application> findByEmailOrderByCreatedAtDesc(String email);

    List<Application> findByStatusOrderByCreatedAtDesc(String status);

    List<Application> findByReviewStatusOrderByCreatedAtDesc(String reviewStatus);

    boolean existsByPrn(String prn);
}
