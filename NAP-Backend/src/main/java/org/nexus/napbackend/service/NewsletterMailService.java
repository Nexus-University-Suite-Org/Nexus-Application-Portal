package org.nexus.napbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class NewsletterMailService {

    private static final Logger log = LoggerFactory.getLogger(NewsletterMailService.class);

    private final JavaMailSender mailSender;

    public NewsletterMailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Newsletter email sent to {}", to);
        } catch (MessagingException ex) {
            log.warn("Failed to send newsletter email to {}: {}", to, ex.getMessage());
        }
    }
}
