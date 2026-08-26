package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findAllByOrderByDisplayOrderAsc();
}
