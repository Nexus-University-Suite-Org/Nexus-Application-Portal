package org.nexus.napbackend.listener;

import org.nexus.napbackend.event.PaymentRecordedEvent;
import org.nexus.napbackend.model.Notification;
import org.nexus.napbackend.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentRecordedListener {

    private final NotificationService notificationService;

    public PaymentRecordedListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handlePaymentRecorded(PaymentRecordedEvent event) {
        Notification notification = new Notification();
        notification.setUserId(event.getStudentId());
        notification.setType("PAYMENT_RECORDED");
        notification.setTitle("Payment Received");
        notification.setMessage("Payment of " + event.getAmountPaid() + " recorded. Remaining balance: " + event.getBalance() + ".");
        notification.setRelatedId(event.getStudentFeeId());
        notification.setRead(false);
        notificationService.create(notification);
    }
}
