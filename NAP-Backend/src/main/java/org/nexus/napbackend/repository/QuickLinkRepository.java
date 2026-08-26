package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.QuickLink;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuickLinkRepository extends JpaRepository<QuickLink, Long> {

    List<QuickLink> findAllByOrderByDisplayOrderAsc();
}
