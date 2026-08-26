package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.Partner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerRepository extends JpaRepository<Partner, Long> {

    List<Partner> findAllByOrderByCreatedAtDesc();
}
