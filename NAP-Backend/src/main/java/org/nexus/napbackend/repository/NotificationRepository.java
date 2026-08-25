package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(Long userId, Boolean read);

    @Modifying
    @Query("UPDATE Notification n SET n.read = :read WHERE n.userId = :userId AND n.read = :currentRead")
    int markAll(@Param("userId") Long userId, @Param("read") Boolean read, @Param("currentRead") Boolean currentRead);
}
