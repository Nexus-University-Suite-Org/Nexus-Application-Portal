-- Seed data for CMS tables (PostgreSQL compatible)
-- Runs after Hibernate DDL via spring.jpa.defer-datasource-initialization=true

-- Tenant (id=1 is referenced by all CMS tables)
INSERT INTO tenants (code, name, created_at) SELECT 'demo', 'University Application Portal', NOW() WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE code = 'demo');

-- ============================================
-- SITE SETTINGS (portal_name, nav_links, cta_buttons)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, setting_key)
);

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'portal_name', 'University Application Portal', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'portal_name');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'nav_links', '[{"label":"Home","href":"/","visible":true},{"label":"About","href":"/about","visible":true},{"label":"News","href":"/news","visible":true},{"label":"Programs","href":"/programs","visible":true},{"label":"Impact","href":"/impact","visible":true},{"label":"Stories","href":"/stories","visible":true},{"label":"Gallery","href":"/gallery","visible":true},{"label":"Partners","href":"/partners","visible":true},{"label":"Contact","href":"/contact","visible":true}]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'nav_links');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'cta_buttons', '[{"label":"Apply Now","href":"/admissions/how-to-apply","style":"accent","visible":true},{"label":"Donate","href":"/donate","style":"outline","visible":true}]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'cta_buttons');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_tagline', 'Empowering Communities Since 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_tagline');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_heading_1', 'Empowering Single Mothers', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_heading_1');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_heading_2', '& Vulnerable Youth', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_heading_2');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_heading_3', 'Through Practical Skills', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_heading_3');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_subtitle', 'We equip vulnerable youth and single mothers with vocational skills that enable them to earn sustainable livelihoods and build better futures.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_subtitle');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_cta_donate', 'Donate Now', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_cta_donate');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_cta_sponsor', 'Sponsor a Student', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_cta_sponsor');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_cta_donate_visible', 'true', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_cta_donate_visible');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_cta_sponsor_visible', 'true', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_cta_sponsor_visible');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_cta_learn_more', 'Learn More', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_cta_learn_more');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_cta_learn_more_visible', 'true', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_cta_learn_more_visible');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'hero_stats', '[{"value":"1,200+","label":"Students Trained"},{"value":"70%","label":"Women & Single Mothers"},{"value":"300+","label":"Graduates Running Businesses"},{"value":"8","label":"Vocational Programs"}]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'hero_stats');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'what_we_teach_tagline', 'What We Teach', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'what_we_teach_tagline');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'what_we_teach_heading_1', 'Practical Skills That', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'what_we_teach_heading_1');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'what_we_teach_heading_2', 'Create Real Livelihoods', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'what_we_teach_heading_2');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'what_we_teach_subtitle', 'Our vocational programs are designed for immediate employment and entrepreneurship. Each graduate leaves with the skills to earn income from day one.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'what_we_teach_subtitle');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'what_we_teach_programs', '[{"title":"Tailoring & Design","duration":"6 months","outcome":"Run your own shop"},{"title":"Electrical Installation","duration":"8 months","outcome":"Certified electrician"},{"title":"Plumbing","duration":"8 months","outcome":"Start a plumbing business"},{"title":"Welding & Fabrication","duration":"6 months","outcome":"Fabrication workshop owner"},{"title":"Hairdressing","duration":"4 months","outcome":"Open your own salon"},{"title":"Beauty Therapy","duration":"4 months","outcome":"Freelance beauty therapist"}]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'what_we_teach_programs');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'what_we_teach_btn_text', 'View All Programs', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'what_we_teach_btn_text');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'what_we_teach_btn_visible', 'true', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'what_we_teach_btn_visible');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_tagline', 'Student Success Story', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_tagline');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_quote', 'I went from nothing to owning my own business.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_quote');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_author', 'Mary Nakato', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_author');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_program', 'Tailoring & Design', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_program');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_outcome', 'Now runs a successful tailoring shop', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_outcome');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_btn_text', 'Read More Stories', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_btn_text');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_btn_visible', 'true', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_btn_visible');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'success_story_stats', '[{"val":"1,200+","label":"Lives Changed"},{"val":"300+","label":"Businesses Started"},{"val":"12+","label":"Communities Reached"}]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'success_story_stats');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'donate_tagline', 'Make A Difference', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'donate_tagline');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'donate_heading_1', 'Your Support Changes', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'donate_heading_1');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'donate_heading_2', 'A Life', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'donate_heading_2');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'donate_subtitle', 'Every contribution — large or small — directly funds training, materials, and opportunity for those who need it most.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'donate_subtitle');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'donate_tiers', '[{"amount":"$10","impact":"Provides learning materials for one student"},{"amount":"$25","impact":"Covers essential training tools"},{"amount":"$50","impact":"Sponsors a student for one month"},{"amount":"$200","impact":"Covers full training support"}]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'donate_tiers');

INSERT INTO site_settings (tenant_id, setting_key, setting_value, created_at, updated_at)
SELECT 1, 'footer_mission', 'Empowering single mothers and vulnerable youth through practical vocational skills — building dignified livelihoods one graduate at a time.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE tenant_id = 1 AND setting_key = 'footer_mission');

-- ============================================
-- NEWS ARTICLES
-- ============================================
INSERT INTO news_articles (tenant_id, title, slug, excerpt, content, category, image_url, featured, published, published_at, created_at) VALUES
(1, 'University Application Portal Ranks Among Top 200 Globally',
 'university-application-portal-ranks-among-top-200-globally',
 'For the first time in its history, the university has entered the top 200 of the World University Rankings.',
 'The latest rankings cite research output, graduate employability, and international collaboration as the main drivers behind the move into the global top tier. The result follows several years of strategic investment in research labs, scholarship support, and faculty recruitment.

Institution leaders said the milestone is important not only as a prestige marker, but as evidence that the long-term academic strategy is producing measurable outcomes. Particular recognition was given to interdisciplinary research centers, industry partnerships, and student support services that improved retention and progression rates.

The university now plans to use the momentum to strengthen postgraduate research, expand international exchange programs, and deepen community-facing innovation projects.',
 'Institutional', '/api/v1/content/news/ranking.jpg', true, true, NOW(), NOW());

INSERT INTO news_articles (tenant_id, title, slug, excerpt, content, category, image_url, featured, published, published_at, created_at) VALUES
(1, 'New $12M AI Research Lab Opens on Campus',
 'new-ai-research-lab-opens-on-campus',
 'The new facility will house 60 researchers and focus on ethical AI applications for healthcare, agriculture, and public systems.',
 'The new AI lab brings together faculty from computing, medicine, agriculture, and public policy to develop practical systems with clear social value. The facility includes collaborative workspaces, model evaluation suites, and a secure environment for applied research.

Initial projects include diagnostic support tools for regional clinics, crop risk forecasting systems, and public-service decision support for local agencies.',
 'Research', '/api/v1/content/news/ai-lab.jpg', false, true, NOW(), NOW());

INSERT INTO news_articles (tenant_id, title, slug, excerpt, content, category, image_url, featured, published, published_at, created_at) VALUES
(1, 'Student Startup Raises $2.4M in Seed Funding',
 'student-startup-raises-seed-funding',
 'AgriSense, founded by two engineering students, secured backing for its precision agriculture platform.',
 'AgriSense began as a capstone project focused on affordable field monitoring for smallholder farmers. After successful pilots across three districts, the founding team refined the product into a decision-support platform.

The new financing will support product engineering, regional expansion, and a structured internship program for students interested in agricultural technology.',
 'Innovation', '/api/v1/content/news/startup.jpg', false, true, NOW(), NOW());

INSERT INTO news_articles (tenant_id, title, slug, excerpt, content, category, image_url, featured, published, published_at, created_at) VALUES
(1, 'Spring Graduation Celebrates 3,200 Graduates',
 'spring-graduation-celebrates-3200',
 'The largest graduating class in university history included students from 48 countries.',
 'This year''s graduation ceremony marked the largest class in the institute''s history, with graduates representing a wide mix of disciplines and national backgrounds.

Student speakers reflected on the value of interdisciplinary learning and the confidence built through project-based coursework, internships, and faculty mentorship.',
 'Campus', '/api/v1/content/news/graduation.jpg', false, true, NOW(), NOW());

INSERT INTO news_articles (tenant_id, title, slug, excerpt, content, category, image_url, featured, published, published_at, created_at) VALUES
(1, 'Partnership with MIT Launches Joint Research Program',
 'partnership-with-mit-launches-joint-research-program',
 'A five-year collaboration will support quantum computing research and graduate exchange opportunities.',
 'The new agreement creates a multi-year framework for shared research agendas, visiting scholar placements, and co-supervised graduate work. Initial emphasis will be on quantum systems and advanced materials.',
 'Partnerships', '/api/v1/content/news/mit.jpg', false, true, NOW(), NOW());

-- ============================================
-- EVENTS
-- ============================================
INSERT INTO cms_events (tenant_id, title, description, event_date, image_url, published, created_at, updated_at) VALUES
(1, 'Open Day 2026', 'Join us for campus tours, faculty meetings, and program information sessions.', NOW() + INTERVAL '30 days', '/api/v1/content/events/open-day.jpg', true, NOW(), NOW());

INSERT INTO cms_events (tenant_id, title, description, event_date, image_url, published, created_at, updated_at) VALUES
(1, 'Research Symposium 2026', 'Annual research symposium featuring keynote speakers from industry and academia.', NOW() + INTERVAL '45 days', '/api/v1/content/events/symposium.jpg', true, NOW(), NOW());

INSERT INTO cms_events (tenant_id, title, description, event_date, image_url, published, created_at, updated_at) VALUES
(1, 'International Culture Week', 'Celebrate diversity with performances, food, and cultural exhibitions from around the world.', NOW() + INTERVAL '60 days', '/api/v1/content/events/culture-week.jpg', true, NOW(), NOW());

INSERT INTO cms_events (tenant_id, title, description, event_date, image_url, published, created_at, updated_at) VALUES
(1, 'Alumni Homecoming', 'Annual alumni reunion with networking sessions, campus tours, and gala dinner.', NOW() + INTERVAL '90 days', '/api/v1/content/events/homecoming.jpg', true, NOW(), NOW());

-- ============================================
-- FAQs
-- ============================================
INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Admissions', 'What are the entry requirements for undergraduate programs?',
 'Applicants need a minimum of 5 O-Level credits including English and Mathematics, and 2 principal passes at A-Level or equivalent qualifications.', 1, NOW());

INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Admissions', 'How do I apply for admission?',
 'You can apply online through our application portal. Create an account, fill in your details, upload required documents, and submit your application.', 2, NOW());

INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Admissions', 'What is the application deadline?',
 'The main application deadline is typically in March for the September intake. A second intake may be available in January for select programs.', 3, NOW());

INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Fees', 'What are the tuition fees?',
 'Tuition fees vary by program and level of study. Undergraduate programs typically range from UGX 2,500,000 to 4,500,000 per year.', 4, NOW());

INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Fees', 'Are there payment plans available?',
 'Yes, we offer flexible payment plans including full payment discounts, installment plans (4 equal payments), and employer sponsorship arrangements.', 5, NOW());

INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Student Life', 'Is accommodation available on campus?',
 'On-campus residence is available for first-year students and subject to availability. The university also maintains a list of approved off-campus options.', 6, NOW());

INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Student Life', 'What student support services are available?',
 'We offer academic advising, career counseling, health services, disability support, library services, IT help desk, and various student organizations.', 7, NOW());

INSERT INTO faqs (tenant_id, category, question, answer, display_order, created_at) VALUES
(1, 'Academic', 'How do I register for courses?',
 'Course registration is done online through the student portal during the registration period. Consult with your academic advisor before selecting courses.', 8, NOW());

-- ============================================
-- ALUMNI
-- ============================================
INSERT INTO alumni (tenant_id, name, program, graduation_year, bio, image_url, created_at) VALUES
(1, 'Sarah Nakamya', 'BSc Computer Science', 2018,
 'Sarah is now a Senior Software Engineer at a leading fintech company. She credits the practical projects and mentorship for her career success.',
 '/api/v1/content/alumni/sarah.jpg', NOW());

INSERT INTO alumni (tenant_id, name, program, graduation_year, bio, image_url, created_at) VALUES
(1, 'James Okello', 'BSc Business Administration', 2015,
 'James founded a successful agribusiness that employs over 200 people across East Africa.',
 '/api/v1/content/alumni/james.jpg', NOW());

INSERT INTO alumni (tenant_id, name, program, graduation_year, bio, image_url, created_at) VALUES
(1, 'Grace Achieng', 'BA Education', 2019,
 'Grace is a high school principal who has transformed her school into one of the top-performing institutions in her district.',
 '/api/v1/content/alumni/grace.jpg', NOW());

INSERT INTO alumni (tenant_id, name, program, graduation_year, bio, image_url, created_at) VALUES
(1, 'David Mugisha', 'BEng Mechanical Engineering', 2017,
 'David works as a project manager at a major construction firm and has led several landmark building projects.',
 '/api/v1/content/alumni/david.jpg', NOW());

-- ============================================
-- PARTNERS
-- ============================================
INSERT INTO partners (tenant_id, name, description, logo_url, website_url, created_at) VALUES
(1, 'TechCorp International', 'Leading technology company providing internship and employment opportunities.', '/api/v1/content/partners/techcorp.png', 'https://techcorp.example.com', NOW());

INSERT INTO partners (tenant_id, name, description, logo_url, website_url, created_at) VALUES
(1, 'East African Development Bank', 'Financial partner supporting student loans and research funding.', '/api/v1/content/partners/eadb.png', 'https://eadb.example.com', NOW());

INSERT INTO partners (tenant_id, name, description, logo_url, website_url, created_at) VALUES
(1, 'Global Health Initiative', 'Research partner collaborating on public health projects.', '/api/v1/content/partners/ghi.png', 'https://ghi.example.com', NOW());

INSERT INTO partners (tenant_id, name, description, logo_url, website_url, created_at) VALUES
(1, 'Ministry of Education', 'Government partner supporting policy research and educational development.', '/api/v1/content/partners/moe.png', 'https://education.example.com', NOW());

-- ============================================
-- SCHOLARSHIPS
-- ============================================
INSERT INTO scholarships (tenant_id, title, description, eligibility, deadline, created_at) VALUES
(1, 'Merit-Based Excellence Scholarship',
 'Full tuition scholarship for outstanding academic performers. Covers tuition, accommodation, and a monthly stipend.',
 'Minimum A-Level aggregate of 10 points. Must be a first-year applicant.',
 NOW() + INTERVAL '60 days', NOW());

INSERT INTO scholarships (tenant_id, title, description, eligibility, deadline, created_at) VALUES
(1, 'Community Service Scholarship',
 'Partial scholarship for students demonstrating exceptional community service commitment. Covers 50% of tuition.',
 'Evidence of sustained community service involvement. Personal statement required.',
 NOW() + INTERVAL '45 days', NOW());

INSERT INTO scholarships (tenant_id, title, description, eligibility, deadline, created_at) VALUES
(1, 'STEM Women Scholarship',
 'Scholarship for women pursuing STEM programs. Covers full tuition and provides mentorship.',
 'Female applicants to STEM programs. Minimum B- average at A-Level.',
 NOW() + INTERVAL '30 days', NOW());

-- ============================================
-- STUDENT STORIES
-- ============================================
INSERT INTO student_stories (tenant_id, title, slug, content, author, featured, created_at) VALUES
(1, 'From Village to Virtual Reality Lab',
 'from-village-to-virtual-reality-lab',
 'Growing up in a small village in northern Uganda, I never imagined I would be working with virtual reality technology. The computer science program opened doors I didn''t know existed. Through the innovation hub, I gained access to cutting-edge equipment and mentorship.

Today, I am developing VR training modules for healthcare workers in rural areas. The same technology that once seemed impossibly distant is now helping save lives.',
 'Patrick Okumu', true, NOW());

INSERT INTO student_stories (tenant_id, title, slug, content, author, featured, created_at) VALUES
(1, 'Building a Business from Classroom Knowledge',
 'building-a-business-from-classroom-knowledge',
 'When I enrolled in the business program, I thought I was just getting a degree. What I actually got was a blueprint for building a company. The entrepreneurship courses and incubator program gave me confidence and skills.

Two years later, our company works with over 500 farmers and has expanded to three districts.',
 'Naluza Ssemakula', true, NOW());

INSERT INTO student_stories (tenant_id, title, slug, content, author, featured, created_at) VALUES
(1, 'Research That Changes Lives',
 'research-that-changes-lives',
 'My research project on clean water access started as a class assignment and became my life''s work. With faculty guidance and a small research grant, I developed a low-cost water purification system now used in 12 communities.

The university didn''t just teach me science - it taught me how to apply science to real problems.',
 'Esther Namutebi', false, NOW());

-- ============================================
-- LEGAL PAGES
-- ============================================
INSERT INTO legal_pages (tenant_id, title, slug, type, version, updated_date, content, created_at) VALUES
(1, 'Privacy Policy', 'privacy-policy', 'privacy', '2.1', CURRENT_DATE,
 'We are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information. We implement appropriate security measures to protect your personal information against unauthorized access.',
 NOW());

INSERT INTO legal_pages (tenant_id, title, slug, type, version, updated_date, content, created_at) VALUES
(1, 'Terms and Conditions', 'terms-and-conditions', 'terms', '1.3', CURRENT_DATE,
 'By accessing and using this portal, you accept and agree to be bound by these terms and conditions. All information submitted must be truthful and accurate. Content on this portal is protected by copyright laws.',
 NOW());

-- ============================================
-- QUICK LINKS
-- ============================================
INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'Student Portal', '/quick-links/student-portal', 'Monitor', 1, NOW());

INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'Course Catalog', '/quick-links/course-catalog', 'BookOpen', 2, NOW());

INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'Library', '/quick-links/library-portal', 'Library', 3, NOW());

INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'Exam Results', '/quick-links/exam-results', 'FileText', 4, NOW());

INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'Contact Us', '/quick-links/contact-us', 'Phone', 5, NOW());

INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'Campus Map', '/quick-links/campus-map', 'Map', 6, NOW());

INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'Academic Calendar', '/quick-links/academic-calendar', 'Calendar', 7, NOW());

INSERT INTO quick_links (tenant_id, title, url, icon, display_order, created_at) VALUES
(1, 'IT Help Desk', '/quick-links/it-help-desk', 'HelpCircle', 8, NOW());

-- ============================================
-- COURSE CATALOG
-- ============================================
INSERT INTO course_catalog (tenant_id, name, code, college, level, duration, credits, image_url, published, created_at, updated_at) VALUES
(1, 'Bachelor of Science in Computer Science', 'BSC-CS', 'College of Computing and Information Sciences', 'Undergraduate', '4 years', 120, '/api/v1/content/courses/cs.jpg', true, NOW(), NOW());

INSERT INTO course_catalog (tenant_id, name, code, college, level, duration, credits, image_url, published, created_at, updated_at) VALUES
(1, 'Bachelor of Business Administration', 'BBA-BA', 'College of Business and Management Sciences', 'Undergraduate', '3 years', 90, '/api/v1/content/courses/bba.jpg', true, NOW(), NOW());

INSERT INTO course_catalog (tenant_id, name, code, college, level, duration, credits, image_url, published, created_at, updated_at) VALUES
(1, 'Bachelor of Engineering in Mechanical Engineering', 'BENG-ME', 'College of Engineering, Design, Art and Technology', 'Undergraduate', '5 years', 150, '/api/v1/content/courses/me.jpg', true, NOW(), NOW());

INSERT INTO course_catalog (tenant_id, name, code, college, level, duration, credits, image_url, published, created_at, updated_at) VALUES
(1, 'Bachelor of Arts in Education', 'BA-EDU', 'College of Education and External Studies', 'Undergraduate', '3 years', 90, '/api/v1/content/courses/edu.jpg', true, NOW(), NOW());

INSERT INTO course_catalog (tenant_id, name, code, college, level, duration, credits, image_url, published, created_at, updated_at) VALUES
(1, 'Master of Science in Data Science', 'MSC-DS', 'College of Computing and Information Sciences', 'Postgraduate', '2 years', 60, '/api/v1/content/courses/ds.jpg', true, NOW(), NOW());

INSERT INTO course_catalog (tenant_id, name, code, college, level, duration, credits, image_url, published, created_at, updated_at) VALUES
(1, 'Bachelor of Medicine and Bachelor of Surgery', 'MBCHB', 'College of Health Sciences', 'Undergraduate', '5 years', 180, '/api/v1/content/courses/med.jpg', true, NOW(), NOW());

-- ============================================
-- FACULTY MEMBERS
-- ============================================
INSERT INTO faculty_members (tenant_id, name, title, department, bio, email, specialization, display_order, created_at) VALUES
(1, 'Prof. Sarah Nakato', 'Professor of Computer Science', 'Department of Computer Science',
 'Prof. Nakato has over 20 years of teaching and research experience in AI and machine learning.',
 's.nakato@university.example.com', 'Artificial Intelligence, Machine Learning', 1, NOW());

INSERT INTO faculty_members (tenant_id, name, title, department, bio, email, specialization, display_order, created_at) VALUES
(1, 'Dr. James Mukasa', 'Senior Lecturer', 'Department of Business Administration',
 'Dr. Mukasa specializes in strategic management and entrepreneurship. He coordinates the incubator program.',
 'j.mukasa@university.example.com', 'Strategic Management, Entrepreneurship', 2, NOW());

INSERT INTO faculty_members (tenant_id, name, title, department, bio, email, specialization, display_order, created_at) VALUES
(1, 'Prof. Grace Owino', 'Professor of Education', 'Department of Educational Foundations',
 'Prof. Owino is a leading researcher in curriculum development and teacher education.',
 'g.owino@university.example.com', 'Curriculum Development, Teacher Education', 3, NOW());

INSERT INTO faculty_members (tenant_id, name, title, department, bio, email, specialization, display_order, created_at) VALUES
(1, 'Dr. David Ssekandi', 'Lecturer in Mechanical Engineering', 'Department of Mechanical Engineering',
 'Dr. Ssekandi brings industry experience and leads the renewable energy research group.',
 'd.ssekandi@university.example.com', 'Renewable Energy, Sustainable Engineering', 4, NOW());

-- ============================================
-- PAGE SECTIONS
-- ============================================
INSERT INTO page_sections (tenant_id, page_key, section_key, title, subtitle, body, image_url, created_at, updated_at) VALUES
(1, 'home', 'hero',
 'Welcome to University Application Portal',
 'Empowering the next generation of leaders through excellence in education, research, and community engagement.',
 NULL, '/api/v1/content/page-sections/hero.jpg', NOW(), NOW());

INSERT INTO page_sections (tenant_id, page_key, section_key, title, subtitle, body, image_url, created_at, updated_at) VALUES
(1, 'home', 'mission',
 'Our Mission',
 'To provide transformative education that prepares students for global challenges while serving community needs.',
 NULL, NULL, NOW(), NOW());

INSERT INTO page_sections (tenant_id, page_key, section_key, title, subtitle, body, image_url, created_at, updated_at) VALUES
(1, 'home', 'stats',
 'Impact Numbers',
 NULL,
 '{"students": "32000+", "programs": "200+", "countries": "48", "employment_rate": "92%"}',
 NULL, NOW(), NOW());

INSERT INTO page_sections (tenant_id, page_key, section_key, title, subtitle, body, image_url, created_at, updated_at) VALUES
(1, 'about', 'overview',
 'About the University',
 'Founded in 1922, the university has grown from a small technical school into a leading institution of higher learning.',
 'With over 32,000 students across 10 colleges, we continue to push boundaries in research, teaching, and community engagement.',
 NULL, NOW(), NOW());

-- ============================================
-- FEE ASSIGNMENTS (sample)
-- ============================================
INSERT INTO fee_assignments (tenant_id, item_name, category, year_level, semester, academic_year, amount, currency, college, notes, created_at) VALUES
(1, 'Tuition Fee', 'Tuition', 'Year 1', 'Semester 1', '2026', 3500000, 'UGX', 'College of Computing', 'Core academic instruction', NOW());

INSERT INTO fee_assignments (tenant_id, item_name, category, year_level, semester, academic_year, amount, currency, college, notes, created_at) VALUES
(1, 'Technology Fee', 'Service', 'Year 1', 'Semester 1', '2026', 500000, 'UGX', 'College of Computing', 'Lab and digital resources', NOW());

INSERT INTO fee_assignments (tenant_id, item_name, category, year_level, semester, academic_year, amount, currency, college, notes, created_at) VALUES
(1, 'Tuition Fee', 'Tuition', 'Year 1', 'Semester 1', '2026', 2800000, 'UGX', 'College of Business', 'Core academic instruction', NOW());

INSERT INTO fee_assignments (tenant_id, item_name, category, year_level, semester, academic_year, amount, currency, college, notes, created_at) VALUES
(1, 'Technology Fee', 'Service', 'Year 1', 'Semester 1', '2026', 400000, 'UGX', 'College of Business', 'Lab and digital resources', NOW());

-- ============================================
-- NOTIFICATIONS (sample for user_id=1)
-- ============================================
INSERT INTO notifications (tenant_id, user_id, type, title, message, "read", created_at) VALUES
(1, 1, 'info', 'Welcome to Nexus Portal', 'Your account has been created successfully. Explore the portal to get started.', false, NOW());

INSERT INTO notifications (tenant_id, user_id, type, title, message, "read", created_at) VALUES
(1, 1, 'announcement', 'New Scholarship Available', 'The STEM Women Scholarship is now open for applications. Deadline is in 30 days.', false, NOW());

INSERT INTO notifications (tenant_id, user_id, type, title, message, "read", created_at) VALUES
(1, 1, 'success', 'Application Received', 'Your application has been successfully submitted. You will receive updates via email.', true, NOW());

-- ============================================
-- MESSAGES (sample for user_id=1)
-- ============================================
INSERT INTO messages (tenant_id, from_user_id, to_user_id, subject, body, sender_deleted, recipient_deleted, sender_starred, recipient_starred, sender_archived, recipient_archived, read_at, created_at) VALUES
(1, 2, 1, 'Welcome to the Portal', 'Hello! Welcome to the Nexus University Application Portal. We are glad to have you here. If you have any questions, feel free to reach out.', false, false, false, false, false, false, NULL, NOW());

INSERT INTO messages (tenant_id, from_user_id, to_user_id, subject, body, sender_deleted, recipient_deleted, sender_starred, recipient_starred, sender_archived, recipient_archived, read_at, created_at) VALUES
(1, 3, 1, 'Scholarship Opportunity', 'Hi there! I wanted to let you know about a new scholarship opportunity that might interest you. Check the scholarships page for details.', false, false, false, true, false, false, NOW(), NOW());
