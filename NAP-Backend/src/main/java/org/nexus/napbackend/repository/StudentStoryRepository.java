package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.StudentStory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentStoryRepository extends JpaRepository<StudentStory, Long> {

    List<StudentStory> findAllByOrderByCreatedAtDesc();
}
