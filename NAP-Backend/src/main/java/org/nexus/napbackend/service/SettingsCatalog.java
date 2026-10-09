package org.nexus.napbackend.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.nexus.napbackend.dto.SettingDefinition;
import org.springframework.stereotype.Component;

/**
 * Single source of truth for the settings that a university can configure.
 * The admin UI renders from {@link #definitions()} and the ML service reads the
 * persisted values back through the public site-settings endpoint.
 */
@Component
public class SettingsCatalog {

    public static final String GROUP_UNIVERSITY = "university";
    public static final String GROUP_CHAT = "chat";
    public static final String GROUP_BRANDING = "branding";

    private static final List<String> DEFAULT_QUICK_TOPICS = List.of(
            "{\"label\":\"Programs\",\"query\":\"What programs do you offer?\"}",
            "{\"label\":\"Admissions\",\"query\":\"How do I apply?\"}",
            "{\"label\":\"Fees\",\"query\":\"What are the tuition fees and are there scholarships?\"}",
            "{\"label\":\"Contact\",\"query\":\"How can I contact the admissions office?\"}"
    );

    private static final List<SettingDefinition> DEFINITIONS = List.of(
            // --- University profile ------------------------------------------------
            new SettingDefinition("portal_name", "University / portal name", GROUP_UNIVERSITY, "text", "",
                    "Shown in the navbar, footer, chat and notification emails.", false),
            new SettingDefinition("university_motto", "Motto", GROUP_UNIVERSITY, "text", "",
                    "Short motto or tagline.", false),
            new SettingDefinition("footer_mission", "Mission statement", GROUP_UNIVERSITY, "textarea", "",
                    "Displayed in the footer and indexed for the assistant.", true),
            new SettingDefinition("footer_email", "Contact email", GROUP_UNIVERSITY, "text", "",
                    "Public admissions/contact email.", true),
            new SettingDefinition("footer_phone", "Contact phone", GROUP_UNIVERSITY, "text", "",
                    "Public contact phone number.", true),
            new SettingDefinition("footer_whatsapp_cta", "WhatsApp number", GROUP_UNIVERSITY, "text", "",
                    "WhatsApp number used by call-to-action buttons.", true),
            new SettingDefinition("footer_address", "Address", GROUP_UNIVERSITY, "text", "",
                    "Physical/postal address.", true),
            new SettingDefinition("contact_hours", "Office hours", GROUP_UNIVERSITY, "text", "",
                    "e.g. Mon-Fri, 8:00-17:00.", true),
            new SettingDefinition("university_timezone", "Timezone", GROUP_UNIVERSITY, "text", "Africa/Kampala",
                    "IANA timezone used when formatting dates.", false),
            new SettingDefinition("social_facebook", "Facebook URL", GROUP_UNIVERSITY, "text", "", "", false),
            new SettingDefinition("social_twitter", "X / Twitter URL", GROUP_UNIVERSITY, "text", "", "", false),
            new SettingDefinition("social_instagram", "Instagram URL", GROUP_UNIVERSITY, "text", "", "", false),
            new SettingDefinition("social_linkedin", "LinkedIn URL", GROUP_UNIVERSITY, "text", "", "", false),
            new SettingDefinition("social_youtube", "YouTube URL", GROUP_UNIVERSITY, "text", "", "", false),

            // --- Chat assistant ----------------------------------------------------
            new SettingDefinition("chat_enabled", "Assistant enabled", GROUP_CHAT, "boolean", "true",
                    "Turn the on-site assistant on or off.", true),
            new SettingDefinition("chat_display_name", "Assistant name", GROUP_CHAT, "text", "Assistant",
                    "Name shown in the chat header.", true),
            new SettingDefinition("chat_persona_name", "Greeting persona", GROUP_CHAT, "text", "",
                    "Optional first-person name used in the welcome message.", true),
            new SettingDefinition("chat_welcome_message", "Welcome message", GROUP_CHAT, "textarea",
                    "Hi! I'm here to help with anything about our university. What would you like to know?",
                    "Shown before the first message.", true),
            new SettingDefinition("chat_quick_topics", "Quick topics", GROUP_CHAT, "json", "[" + String.join(",", DEFAULT_QUICK_TOPICS) + "]",
                    "JSON array of {label, query} suggested questions.", true),
            new SettingDefinition("chat_fallback_message", "Fallback message", GROUP_CHAT, "textarea",
                    "I'm not sure I have that information yet. Could you rephrase, or contact the admissions office?",
                    "Used when no knowledge base result is found.", true),
            new SettingDefinition("chat_no_answer_message", "No knowledge message", GROUP_CHAT, "textarea",
                    "I don't have that information yet. Please try the contact page and the team will help.",
                    "Used when the knowledge base has no answer.", true),
            new SettingDefinition("chat_escalation_contact", "Escalation contact", GROUP_CHAT, "text", "",
                    "Where the assistant directs users when it cannot help.", true),
            new SettingDefinition("chat_show_sources", "Show sources", GROUP_CHAT, "boolean", "true",
                    "Display the knowledge sources under answers.", true),
            new SettingDefinition("chat_knowledge_collections", "Knowledge collections", GROUP_CHAT, "json",
                    "[\"faqs\",\"programs\",\"courses\",\"page_sections\",\"legal_pages\",\"scholarships\"]",
                    "Restrict the assistant to these content collections.", true),

            // --- Branding / theme --------------------------------------------------
            new SettingDefinition("theme_accent", "Accent colour", GROUP_BRANDING, "color", "38 52% 45%",
                    "HSL triplet applied to the accent design token.", false),
            new SettingDefinition("splash_logo_url", "Splash logo URL", GROUP_BRANDING, "text", "", "", false),
            new SettingDefinition("splash_logo_text", "Splash logo text", GROUP_BRANDING, "text", "", "", false),
            new SettingDefinition("splash_name", "Splash name", GROUP_BRANDING, "text", "", "", false),
            new SettingDefinition("splash_motto", "Splash motto", GROUP_BRANDING, "text", "", "", false),
            new SettingDefinition("splash_status_text", "Splash status text", GROUP_BRANDING, "text", "", "", false)
    );

    private static final Set<String> KEYS = DEFINITIONS.stream()
            .map(SettingDefinition::key)
            .collect(Collectors.toUnmodifiableSet());

    public List<SettingDefinition> definitions() {
        return DEFINITIONS;
    }

    public Set<String> keys() {
        return KEYS;
    }

    public boolean isKnownKey(String key) {
        return key != null && KEYS.contains(key);
    }
}
