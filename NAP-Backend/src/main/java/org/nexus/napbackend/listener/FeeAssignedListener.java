package org.nexus.napbackend.listener;

import org.nexus.napbackend.event.FeeAssignedEvent;
import org.nexus.napbackend.model.Notification;
import org.nexus.napbackend.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class FeeAssignedListener {

    private final NotificationService notificationService;

    public FeeAssignedListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleFeeAssigned(FeeAssignedEvent event) {
        Notification notification = new Notification();
        notification.setUserId(event.getStudentId());
        notification.setType("FEE_ASSIGNED");
        notification.setTitle("New Fee Assigned");
        notification.setMessage("A fee of " + event.getAmount() + " has been assigned to your account.");
        notification.setRelatedId(event.getStudentFeeId());
        notification.setRead(false);
        notificationService.create(notification);
    }
}
