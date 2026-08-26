package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.CmsEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsEventRepository extends JpaRepository<CmsEvent, Long> {

    List<CmsEvent> findByPublishedTrueOrderByEventDateDesc();
}
