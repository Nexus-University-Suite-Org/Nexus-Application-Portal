package org.nexus.napbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ContactMailService {

    private static final Logger log = LoggerFactory.getLogger(ContactMailService.class);

    private static final String ACCENT = "#c9a227";
    private static final String INK = "#0f172a";
    private static final String MUTED = "#64748b";
    private static final String BORDER = "#e2e8f0";

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String toEmail;

    public ContactMailService(JavaMailSender mailSender,
                              @Value("${nap.mail.from:}") String fromEmail,
                              @Value("${nap.mail.contact-to:}") String toEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.toEmail = toEmail;
    }

    public boolean configured() {
        return fromEmail != null && !fromEmail.isBlank() && toEmail != null && !toEmail.isBlank();
    }

    public boolean send(String name, String email, String subject, String message, String receivedAt) {
        if (!configured()) {
            log.warn("Contact SMTP mail not configured (from='{}' to='{}'); skipping", fromEmail, toEmail);
            return false;
        }
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setReplyTo(email);
            helper.setSubject("Contact message: " + subject);
            helper.setText(buildBody(name, email, subject, message, receivedAt), true);
            mailSender.send(mime);
            log.info("Contact email delivered to {} for submission from {}", toEmail, email);
            return true;
        } catch (MessagingException | RuntimeException ex) {
            log.warn("Failed to send contact email: {}", ex.getMessage());
            return false;
        }
    }

    private String buildBody(String name, String email, String subject, String message, String receivedAt) {
        return "<!DOCTYPE html>"
                + "<html lang='en'>"
                + "<body style='margin:0;padding:0;background-color:#eef0f3;'>"
                + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background-color:#eef0f3;padding:28px 12px;'>"
                + "<tr><td align='center'>"
                + "<table role='presentation' cellpadding='0' cellspacing='0' style='max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;'>"

                // Header
                + "<tr><td style='background-color:#0f172a;padding:32px 32px 26px;'>"
                + "<table role='presentation' cellpadding='0' cellspacing='0' width='100%'>"
                + "<tr><td align='center'>"
                + "<div style='display:inline-block;background-color:" + ACCENT + ";color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:6px 14px;border-radius:999px;'>New Contact Message</div>"
                + "<h1 style='margin:16px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;'>Contact &amp; Partnerships</h1>"
                + "<p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#94a3b8;'>Received " + esc(receivedAt) + "</p>"
                + "</td></tr>"
                + "</table>"
                + "</td></tr>"

                // Detail rows
                + "<tr><td style='padding:12px 32px 4px;'>"
                + "<table role='presentation' cellpadding='0' cellspacing='0' width='100%' style='font-family:Arial,Helvetica,sans-serif;font-size:14px;color:" + INK + ";'>"
                + row("From", bold(esc(name)))
                + row("Email", esc(email))
                + row("Subject", esc(subject))
                + "</table>"
                + "</td></tr>"

                // Message box
                + "<tr><td style='padding:16px 32px 10px;'>"
                + "<div style='background-color:#f8fafc;border-left:4px solid " + ACCENT + ";border-radius:8px;padding:18px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:" + INK + ";line-height:1.65;word-break:break-word;'>" + escMessage(message) + "</div>"
                + "</td></tr>"

                // Footer
                + "<tr><td style='padding:4px 32px 28px;'>"
                + "<div style='height:1px;background-color:" + BORDER + ";'></div>"
                + "<p style='margin:18px 0 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:" + MUTED + ";'>"
                + "You are receiving this because someone submitted the contact form on your website.<br/>"
                + "Replies go to <b style='color:" + INK + ";'>" + esc(email) + "</b>."
                + "</p>"
                + "</td></tr>"

                + "</table>"
                + "</td></tr>"
                + "</table>"
                + "</body></html>";
    }

    private String row(String label, String value) {
        return "<tr>"
                + "<td style='padding:12px 0;border-bottom:1px solid " + BORDER + ";vertical-align:top;width:110px;'>"
                + "<span style='font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:" + MUTED + ";'>" + label + "</span>"
                + "</td>"
                + "<td style='padding:12px 0 12px 16px;border-bottom:1px solid " + BORDER + ";'>"
                + "<span style='font-family:Arial,Helvetica,sans-serif;font-size:14px;color:" + INK + ";word-break:break-word;'>" + value + "</span>"
                + "</td>"
                + "</tr>";
    }

    private String bold(String value) {
        return "<b style='font-family:Arial,Helvetica,sans-serif;font-size:14px;color:" + INK + ";'>" + value + "</b>";
    }

    private String escMessage(String value) {
        if (value == null || value.isBlank()) {
            return "<span style='color:" + MUTED + ";'>—</span>";
        }
        return esc(value);
    }

    private String esc(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>");
    }
}