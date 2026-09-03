package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.nexus.napbackend.model.NewsletterSubscription;
import org.nexus.napbackend.repository.NewsletterSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NewsletterNotificationService {

    private static final Logger log = LoggerFactory.getLogger(NewsletterNotificationService.class);
    private static final DateTimeFormatter RECEIVED_AT_FORMAT =
            DateTimeFormatter.ofPattern("EEEE, d MMMM uuuu 'at' HH:mm").withLocale(java.util.Locale.ENGLISH);

    private final NewsletterSubscriptionRepository subscriptionRepository;
    private final NewsletterMailService mailService;
    private final ExecutorService notificationExecutor;

    public NewsletterNotificationService(NewsletterSubscriptionRepository subscriptionRepository,
                                         NewsletterMailService mailService) {
        this.subscriptionRepository = subscriptionRepository;
        this.mailService = mailService;
        this.notificationExecutor = Executors.newVirtualThreadPerTaskExecutor();
    }

    /**
     * Broadcast a News & Events update to all newsletter subscribers.
     */
    public void broadcastNewsUpdate(String settingKey, String settingValue) {
        List<String> subscribers = new ArrayList<>();
        try {
            for (NewsletterSubscription sub : subscriptionRepository.findAll()) {
                if (sub.getEmail() != null && !sub.getEmail().isBlank()) {
                    subscribers.add(sub.getEmail());
                }
            }
        } catch (Exception ex) {
            log.warn("Could not load newsletter subscriptions: {}", ex.getMessage());
            return;
        }

        if (subscribers.isEmpty()) {
            log.info("No newsletter subscribers to notify for {}", settingKey);
            return;
        }

        String subject = "News & Events Update";
        String html = buildHtml(settingKey, settingValue);

        subscribers.forEach(email -> notificationExecutor.submit(() -> {
            try {
                mailService.sendHtml(email, subject, html);
            } catch (Exception ex) {
                log.warn("Newsletter broadcast failed for {}: {}", email, ex.getMessage());
            }
        }));
    }

    private String buildHtml(String settingKey, String settingValue) {
        String timestamp = RECEIVED_AT_FORMAT.format(ZonedDateTime.now(ZoneId.of("Africa/Kampala")));
        String headline = "News & Events Update";
        String summary = summarize(settingKey, settingValue);

        return "<!DOCTYPE html>"
                + "<html><head><meta charset=\"UTF-8\"></head>"
                + "<body style=\"margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;\">"
                + "<div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;\">"
                + "  <div style=\"background-color:#6d58c2;padding:28px 32px;text-align:center;\">"
                + "    <div style=\"font-size:12px;letter-spacing:3px;color:#cbbff2;text-transform:uppercase;margin-bottom:6px;\">University Application Portal</div>"
                + "    <div style=\"font-size:26px;font-weight:bold;color:#ffffff;\">" + headline + "</div>"
                + "  </div>"
                + "  <div style=\"padding:32px;\">"
                + "    <p style=\"font-size:14px;color:#52525b;line-height:1.7;margin:0 0 20px;\">We have new updates to share with you from our News &amp; Events page.</p>"
                + "    <div style=\"background-color:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:20px;\">"
                + "      <div style=\"font-size:11px;letter-spacing:2px;color:#a1a1aa;text-transform:uppercase;margin-bottom:8px;\">Highlights</div>"
                + "      <div style=\"font-size:15px;color:#18181b;line-height:1.7;white-space:pre-wrap;\">" + summary + "</div>"
                + "    </div>"
                + "    <p style=\"font-size:12px;color:#52525b;line-height:1.7;margin:20px 0 0;\">"
                + "      <strong>Updated:</strong> " + timestamp + "</p>"
                + "    <p style=\"font-size:13px;color:#18181b;line-height:1.7;margin:24px 0 0;\">"
                + "      <a href=\"/news\" style=\"display:inline-block;background-color:#6d58c2;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;\">"
                + "        Read More on the News Page</a></p>"
                + "  </div>"
                + "  <div style=\"background-color:#f4f4f5;padding:20px 32px;text-align:center;font-size:12px;color:#a1a1aa;\">"
                + "    You are receiving this because you subscribed to updates. © " + LocalDateTime.now().getYear()
                + " University Application Portal. All rights reserved.</div>"
                + "</div></body></html>";
    }

    private String summarize(String settingKey, String settingValue) {
        if (settingValue == null || settingValue.isBlank()) {
            return humanizeKey(settingKey) + " was updated.";
        }
        if (settingKey.equals("news_articles") || settingKey.equals("news_events")) {
            return summarizeJsonList(settingKey, settingValue);
        }
        if (settingKey.startsWith("news_featured_")) {
            return humanizeKey(settingKey) + ": " + escapeHtml(settingValue);
        }
        return humanizeKey(settingKey) + ": " + escapeHtml(settingValue);
    }

    private String summarizeJsonList(String settingKey, String settingValue) {
        try {
            tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.ObjectMapper();
            tools.jackson.databind.JsonNode root = mapper.readTree(settingValue);
            StringBuilder sb = new StringBuilder();
            if (root.isArray()) {
                for (tools.jackson.databind.JsonNode node : root) {
                    String title = node.path("title").asText("");
                    String category = node.path("category").asText("");
                    String excerpt = node.path("excerpt").asText("");
                    String name = node.path("name").asText("");
                    String date = node.path("date").asText("");
                    String type = node.path("type").asText("");
                    String label = !title.isBlank() ? title : name;
                    if (label.isBlank()) {
                        continue;
                    }
                    sb.append("• ");
                    if (!category.isBlank()) {
                        sb.append("[").append(escapeHtml(category)).append("] ");
                    }
                    sb.append(escapeHtml(label));
                    if (!date.isBlank()) {
                        sb.append(" (").append(escapeHtml(date)).append(")");
                    }
                    if (!type.isBlank()) {
                        sb.append(" — ").append(escapeHtml(type));
                    }
                    if (!excerpt.isBlank()) {
                        sb.append("\n  ").append(escapeHtml(excerpt));
                    }
                    sb.append("\n");
                }
            }
            if (sb.length() == 0) {
                return humanizeKey(settingKey) + " (no entries).";
            }
            return sb.toString().trim();
        } catch (Exception ex) {
            return humanizeKey(settingKey) + ": " + escapeHtml(settingValue);
        }
    }

    private String humanizeKey(String key) {
        String cleaned = key.replace("news_", "")
                .replace("_", " ")
                .trim();
        if (cleaned.isBlank()) {
            return "News";
        }
        String[] words = cleaned.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (word.isBlank()) {
                continue;
            }
            sb.append(Character.toUpperCase(word.charAt(0)))
              .append(word.substring(1))
              .append(" ");
        }
        return sb.toString().trim();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
