package com.careerdevelopment.repository;

import com.careerdevelopment.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientUserId);

    Optional<Notification> findByIdAndRecipient_Id(Long id, Long recipientUserId);

    void deleteByRecipient_Id(Long recipientUserId);
}

