package com.careerdevelopment.service;

import com.careerdevelopment.dto.notification.NotificationResponse;
import com.careerdevelopment.model.Notification;
import com.careerdevelopment.model.User;
import com.careerdevelopment.model.enums.NotificationType;
import com.careerdevelopment.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> listForRecipient(Long recipientUserId) {
        List<Notification> list = notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(recipientUserId);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void markAsRead(Long notificationId, Long recipientUserId) {
        Notification notification = notificationRepository.findByIdAndRecipient_Id(notificationId, recipientUserId)
                .orElseThrow(() -> new com.careerdevelopment.exception.ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void create(User recipient, String title, String message, NotificationType type) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setRead(false);
        notificationRepository.save(n);
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setRead(n.isRead());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }
}

