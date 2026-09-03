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
            seedIfEmpty("success_story_quote", "I went from nothing to owning my own business.");
            seedIfEmpty("success_story_author", "Mary Nakato");
            seedIfEmpty("success_story_program", "Tailoring & Design");
            seedIfEmpty("success_story_outcome", "Now runs a successful tailoring shop");
            seedIfEmpty("success_story_btn_text", "Read More Stories");
            seedIfEmpty("success_story_btn_visible", "true");
            seedIfEmpty("success_story_stats", "[{\"val\":\"1,200+\",\"label\":\"Lives Changed\"},{\"val\":\"300+\",\"label\":\"Businesses Started\"},{\"val\":\"12+\",\"label\":\"Communities Reached\"}]");
            seedIfEmpty("donate_tagline", "Make A Difference");
            seedIfEmpty("donate_heading_1", "Your Support Changes");
            seedIfEmpty("donate_heading_2", "A Life");
            seedIfEmpty("donate_subtitle", "Every contribution — large or small — directly funds training, materials, and opportunity for those who need it most.");
            seedIfEmpty("donate_tiers", "[{\"amount\":\"$10\",\"impact\":\"Provides learning materials for one student\"},{\"amount\":\"$25\",\"impact\":\"Covers essential training tools\"},{\"amount\":\"$50\",\"impact\":\"Sponsors a student for one month\"},{\"amount\":\"$200\",\"impact\":\"Covers full training support\"}]");
            seedIfEmpty("footer_mission", "Empowering single mothers and vulnerable youth through practical vocational skills — building dignified livelihoods one graduate at a time.");
            seedIfEmpty("about_story_label", "Our Story");
            seedIfEmpty("about_story_heading_1", "Built on Hope,");
            seedIfEmpty("about_story_heading_2", "Powered by Purpose");
            seedIfEmpty("about_story_paragraph", "We started with one belief: that every person — regardless of circumstance — deserves the chance to build a dignified life through skills and hard work.");
            seedIfEmpty("about_founding_label", "Our Founding Story");
            seedIfEmpty("about_founding_heading", "Why We Started");
            seedIfEmpty("about_founding_story", "Our institute was founded after witnessing firsthand the cycle of poverty trapping single mothers and vulnerable youth in our community \u2014 not because of lack of ability, but lack of opportunity and skills.\n\nThe founder, a community leader and educator, believed that practical vocational training \u2014 not charity \u2014 was the most dignified path to self-sufficiency. A small rented space, three sewing machines, and twelve students became the beginning of something far greater.\n\nToday, hundreds of graduates are running their own businesses, supporting their families, and transforming their communities \u2014 one skill at a time.");
            seedIfEmpty("about_mission_label", "Our Mission");
            seedIfEmpty("about_mission_text", "\u201cTo equip vulnerable youth and single mothers with practical vocational skills that enable them to earn sustainable livelihoods.\u201d");
            seedIfEmpty("about_vision_label", "Our Vision");
            seedIfEmpty("about_vision_text", "\u201cA society where every young person has the skills to build a better future.\u201d");
            seedIfEmpty("about_values_label", "What We Stand For");
            seedIfEmpty("about_values_heading", "Our Core Values");
            seedIfEmpty("about_values", "[{\"title\":\"Empowerment\",\"desc\":\"We believe every person has the potential to transform their life through education and practical skills.\"},{\"title\":\"Dignity\",\"desc\":\"We treat every student with respect and create an environment where they feel valued and supported.\"},{\"title\":\"Practical Education\",\"desc\":\"Our programs are designed to give students immediately applicable skills for the real world.\"},{\"title\":\"Community Impact\",\"desc\":\"When we invest in one person, we invest in their entire community. Our graduates create ripple effects of change.\"}]");
            seedIfEmpty("about_programs_btn", "See Our Programs");
            seedIfEmpty("about_cta_label", "Join Our Mission");
            seedIfEmpty("about_cta_heading", "Be Part of the Change");
            seedIfEmpty("about_cta_donate_btn", "Donate Now");
            seedIfEmpty("about_cta_partner_btn", "Partner With Us");
            seedIfEmpty("stories_hero_tagline", "Student Stories");
            seedIfEmpty("stories_hero_heading_1", "Real People.");
            seedIfEmpty("stories_hero_heading_2", "Real Transformation.");
            seedIfEmpty("stories_hero_description", "Behind every statistic is a person whose life was changed by practical skills and the belief that a better future is possible.");
            seedIfEmpty("stories_section_tagline", "Their Journeys");
            seedIfEmpty("stories_section_heading_1", "From Hardship");
            seedIfEmpty("stories_section_heading_2", "To Hope");
            seedIfEmpty("stories_cta_tagline", "Be Part of the Story");
            seedIfEmpty("stories_cta_heading_1", "Help Write the Next");
            seedIfEmpty("stories_cta_heading_2", "Success Story");
            seedIfEmpty("stories_cta_description", "Every student who walks through our doors has the potential to transform their life and their community. Your support makes it possible.");
            seedIfEmpty("stories_cta_btn1_text", "Sponsor a Student");
            seedIfEmpty("stories_cta_btn1_visible", "true");
            seedIfEmpty("stories_cta_btn2_text", "View Programs");
            seedIfEmpty("stories_cta_btn2_visible", "true");
            seedIfEmpty("gallery_hero_tagline", "Photo Gallery");
            seedIfEmpty("gallery_hero_heading_1", "See the Impact");
            seedIfEmpty("gallery_hero_heading_2", "In Action");
            seedIfEmpty("gallery_hero_description", "Photos from our training sessions, graduation ceremonies, student projects, and community activities.");
            seedIfEmpty("splash_logo_url", "");
            seedIfEmpty("splash_logo_text", "IU");
            seedIfEmpty("splash_name", "Institute Uganda");
            seedIfEmpty("splash_motto", "Empowering Through Vocational Skills");
            seedIfEmpty("splash_status_text", "Preparing Experience");
            seedIfEmpty("impact_hero_tagline", "Real Transformation");
            seedIfEmpty("impact_hero_heading_1", "Lives Changed.");
            seedIfEmpty("impact_hero_heading_2", "Communities Transformed.");
            seedIfEmpty("impact_hero_description", "Our graduates are proof that practical skills — combined with determination — can break the cycle of poverty in a single generation.");
            seedIfEmpty("impact_stats_tagline", "By The Numbers");
            seedIfEmpty("impact_stats_heading", "Our Impact In Numbers");
            seedIfEmpty("impact_stats", "[{\"value\":1200,\"suffix\":\"+\",\"label\":\"Total Graduates\"},{\"value\":300,\"suffix\":\"+\",\"label\":\"Businesses Started\"},{\"value\":70,\"suffix\":\"%\",\"label\":\"Women & Single Mothers\"},{\"value\":12,\"suffix\":\"+\",\"label\":\"Communities Reached\"},{\"value\":85,\"suffix\":\"%\",\"label\":\"Employment Rate\"},{\"value\":8,\"suffix\":\"\",\"label\":\"Vocational Programs\"}]");
            seedIfEmpty("impact_stories_tagline", "Graduate Stories");
            seedIfEmpty("impact_stories_heading", "Meet Our Graduates");
            seedIfEmpty("impact_stories_description", "Behind every statistic is a real person with a real story. These are just a few of the lives transformed by our programs.");
            seedIfEmpty("impact_cta_heading", "Help Write the Next Success Story");
            seedIfEmpty("impact_cta_description", "Your donation directly funds a student's journey from vulnerability to self-sufficiency.");
            seedIfEmpty("impact_cta_btn1_text", "Donate Now");
            seedIfEmpty("impact_cta_btn1_visible", "true");
            seedIfEmpty("impact_cta_btn2_text", "Sponsor a Student");
            seedIfEmpty("impact_cta_btn2_visible", "true");
            seedIfEmpty("partners_hero_tagline", "Partnerships");
            seedIfEmpty("partners_hero_heading_1", "Together We Build");
            seedIfEmpty("partners_hero_heading_2", "Stronger Futures");
            seedIfEmpty("partners_hero_description", "Our partners make transformation possible — from corporate sponsors to individual volunteers, every collaboration amplifies our impact.");
            seedIfEmpty("partners_types_tagline", "Ways to Partner");
            seedIfEmpty("partners_types_heading_1", "Find Your Way");
            seedIfEmpty("partners_types_heading_2", "To Make an Impact");
            seedIfEmpty("partners_stats_tagline", "Our Network");
            seedIfEmpty("partners_stats_heading", "Current Partners");
            seedIfEmpty("partners_stats", "[{\"value\":\"{count}\",\"label\":\"Active Partners\"},{\"value\":\"$240K\",\"label\":\"Funds Mobilised\"},{\"value\":\"1,200+\",\"label\":\"Students Supported\"},{\"value\":\"6\",\"label\":\"Countries Represented\"}]");
            seedIfEmpty("partners_partner_types", "[{\"title\":\"Corporate Sponsors\",\"description\":\"Fund training programs, supply equipment, or create internship pipelines for graduates. Your CSR investment directly translates to measurable community impact.\",\"benefits\":[\"Tax-deductible contributions\",\"Brand visibility at events\",\"Impact reports & tracking\",\"Employee volunteer days\"]},{\"title\":\"NGOs & Foundations\",\"description\":\"Collaborate on joint programs, share expertise, or channel funding through our proven training model to reach vulnerable communities.\",\"benefits\":[\"Co-branded programs\",\"Shared impact metrics\",\"Community access\",\"Grant collaboration\"]},{\"title\":\"Volunteer Instructors\",\"description\":\"Share your skills as a guest instructor, mentor graduates, or help with curriculum development. Your expertise creates ripple effects across generations.\",\"benefits\":[\"Flexible commitment\",\"Teaching resources provided\",\"Community connection\",\"Certificate of service\"]},{\"title\":\"Individual Donors\",\"description\":\"Sponsor a student's full training, cover material costs, or contribute monthly to sustain ongoing operations. Every contribution changes a life.\",\"benefits\":[\"Student progress updates\",\"Direct communication\",\"Annual impact letter\",\"Tax receipts\"]}]");
            seedIfEmpty("partners_cta_tagline", "Become a Partner");
            seedIfEmpty("partners_cta_heading_1", "Ready to Change Lives");
            seedIfEmpty("partners_cta_heading_2", "Together?");
            seedIfEmpty("partners_cta_description", "Whether you represent a corporation, an NGO, or you're an individual with skills to share — we'd love to explore how we can work together.");
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
