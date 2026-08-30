package org.nexus.napbackend.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.nexus.napbackend.model.SiteSetting;
import org.nexus.napbackend.repository.SiteSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SiteSettingDataSeeder implements CommandLineRunner {

    private static final Long DEMO_TENANT_ID = 1L;
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Logger log = LoggerFactory.getLogger(SiteSettingDataSeeder.class);

    private final SiteSettingRepository repository;

    public SiteSettingDataSeeder(SiteSettingRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        try {
            seedIfEmpty("portal_name", "University Application Portal");
            seedIfEmpty("nav_links", defaultNavLinks());
            seedIfEmpty("cta_buttons", defaultCtaButtons());
            seedIfEmpty("hero_tagline", "Empowering Communities Since 2010");
            seedIfEmpty("hero_heading_1", "Empowering Single Mothers");
            seedIfEmpty("hero_heading_2", "& Vulnerable Youth");
            seedIfEmpty("hero_heading_3", "Through Practical Skills");
            seedIfEmpty("hero_subtitle", "We equip vulnerable youth and single mothers with vocational skills that enable them to earn sustainable livelihoods and build better futures.");
            seedIfEmpty("hero_cta_donate", "Donate Now");
            seedIfEmpty("hero_cta_sponsor", "Sponsor a Student");
            seedIfEmpty("hero_cta_donate_visible", "true");
            seedIfEmpty("hero_cta_sponsor_visible", "true");
            seedIfEmpty("hero_cta_learn_more", "Learn More");
            seedIfEmpty("hero_cta_learn_more_visible", "true");
            seedIfEmpty("hero_stats", "[{\"value\":\"1,200+\",\"label\":\"Students Trained\"},{\"value\":\"70%\",\"label\":\"Women & Single Mothers\"},{\"value\":\"300+\",\"label\":\"Graduates Running Businesses\"},{\"value\":\"8\",\"label\":\"Vocational Programs\"}]");
            seedIfEmpty("what_we_teach_tagline", "What We Teach");
            seedIfEmpty("what_we_teach_heading_1", "Practical Skills That");
            seedIfEmpty("what_we_teach_heading_2", "Create Real Livelihoods");
            seedIfEmpty("what_we_teach_subtitle", "Our vocational programs are designed for immediate employment and entrepreneurship. Each graduate leaves with the skills to earn income from day one.");
            seedIfEmpty("what_we_teach_programs", "[{\"title\":\"Tailoring & Design\",\"duration\":\"6 months\",\"outcome\":\"Run your own shop\"},{\"title\":\"Electrical Installation\",\"duration\":\"8 months\",\"outcome\":\"Certified electrician\"},{\"title\":\"Plumbing\",\"duration\":\"8 months\",\"outcome\":\"Start a plumbing business\"},{\"title\":\"Welding & Fabrication\",\"duration\":\"6 months\",\"outcome\":\"Fabrication workshop owner\"},{\"title\":\"Hairdressing\",\"duration\":\"4 months\",\"outcome\":\"Open your own salon\"},{\"title\":\"Beauty Therapy\",\"duration\":\"4 months\",\"outcome\":\"Freelance beauty therapist\"}]");
            seedIfEmpty("what_we_teach_btn_text", "View All Programs");
            seedIfEmpty("what_we_teach_btn_visible", "true");
            seedIfEmpty("success_story_tagline", "Student Success Story");
            seedIfEmpty("footer_mission", "Empowering single mothers and vulnerable youth through practical vocational skills — building dignified livelihoods one graduate at a time.");
        } catch (Exception e) {
            log.warn("SiteSetting seeder skipped — table may not exist yet: {}", e.getMessage());
        }
    }

    private void seedIfEmpty(String key, String value) {
        if (repository.findByTenantIdAndSettingKey(DEMO_TENANT_ID, key).isEmpty()) {
            SiteSetting setting = new SiteSetting();
            setting.setTenantId(DEMO_TENANT_ID);
            setting.setSettingKey(key);
            setting.setSettingValue(value);
            setting.setCreatedAt(LocalDateTime.now());
            setting.setUpdatedAt(LocalDateTime.now());
            repository.save(setting);
            log.info("Seeded site setting: {}", key);
        }
    }

    private String defaultNavLinks() {
        try {
            List<Map<String, Object>> links = List.of(
                    Map.of("label", "Home", "href", "/", "visible", true),
                    Map.of("label", "About", "href", "/about", "visible", true),
                    Map.of("label", "News", "href", "/news", "visible", true),
                    Map.of("label", "Programs", "href", "/programs", "visible", true),
                    Map.of("label", "Impact", "href", "/impact", "visible", true),
                    Map.of("label", "Stories", "href", "/stories", "visible", true),
                    Map.of("label", "Gallery", "href", "/gallery", "visible", true),
                    Map.of("label", "Partners", "href", "/partners", "visible", true),
                    Map.of("label", "Contact", "href", "/contact", "visible", true)
            );
            return MAPPER.writeValueAsString(links);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String defaultCtaButtons() {
        try {
            List<Map<String, Object>> buttons = List.of(
                    Map.of("label", "Apply Now", "href", "/admissions/how-to-apply", "style", "accent", "visible", true),
                    Map.of("label", "Donate", "href", "/donate", "style", "outline", "visible", true)
            );
            return MAPPER.writeValueAsString(buttons);
        } catch (Exception e) {
            return "[]";
        }
    }
}
