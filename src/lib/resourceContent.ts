export type ResourceGuide = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  overview: string;
  highlights: string[];
  sections: Array<{ title: string; body: string }>;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export type ResourceLink = {
  slug: string;
  label: string;
  desc: string;
};

const currentYear = new Date().getFullYear();

export const quickLinkGroups: Array<{
  title: string;
  links: ResourceLink[];
}> = [
  {
    title: "Academics",
    links: [
      {
        slug: "course-catalog",
        label: "Course Catalog",
        desc: "Browse all undergraduate and graduate programs",
      },
      {
        slug: "academic-calendar",
        label: "Academic Calendar",
        desc: "Key dates, exam periods, and holidays",
      },
      {
        slug: "library-portal",
        label: "Library Portal",
        desc: "Access digital resources, journals, and databases",
      },
      {
        slug: "exam-results",
        label: "Exam Results",
        desc: "View your grades and transcripts online",
      },
    ],
  },
  {
    title: "Student Services",
    links: [
      {
        slug: "student-portal",
        label: "Student Portal",
        desc: "Registration, enrollment, and course management",
      },
      {
        slug: "student-organizations",
        label: "Student Organizations",
        desc: "Clubs, societies, and extracurricular activities",
      },
      {
        slug: "health-safety",
        label: "Health & Safety",
        desc: "Campus clinic, emergency contacts, and safety info",
      },
      {
        slug: "it-help-desk",
        label: "IT Help Desk",
        desc: "Technical support for students and staff",
      },
    ],
  },
  {
    title: "Contact & Directions",
    links: [
      {
        slug: "contact-us",
        label: "Contact Us",
        desc: "General inquiries and department contacts",
      },
      {
        slug: "directory",
        label: "Directory",
        desc: "Find faculty, staff, and department phone numbers",
      },
      {
        slug: "campus-map",
        label: "Campus Map",
        desc: "Interactive map of buildings, parking, and facilities",
      },
      {
        slug: "forms-documents",
        label: "Forms & Documents",
        desc: "Download official forms and application documents",
      },
    ],
  },
];

export const footerQuickLinks = [
  { label: "Get in Touch", href: "/quick-links/contact-us" },
  { label: "Upcoming Events", href: "/quick-links/upcoming-events" },
  { label: "Jobs & Careers", href: "/quick-links/jobs-careers" },
  { label: "Campus Map", href: "/quick-links/campus-map" },
  {
    label: "Emergency Contacts",
    href: "/quick-links/emergency-contacts",
  },
];

export const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "Twitter", href: "https://www.twitter.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "YouTube", href: "https://www.youtube.com" },
];

export const resourceGuides: ResourceGuide[] = [
  {
    slug: "course-catalog",
    title: "Course Catalog",
    category: "Academics",
    excerpt:
      "Program structures, award paths, and entry routes across colleges.",
    overview:
      "Use the course catalog to compare programs, progression requirements, and the college context around each award path before you apply.",
    highlights: [
      "Undergraduate and postgraduate pathways are grouped by college.",
      "Each program outline explains duration, mode, and entry expectations.",
      "You can move directly from catalog planning to admissions guidance.",
    ],
    sections: [
      {
        title: "How to use it",
        body: "Start with your area of interest, compare duration and learning mode, then shortlist programs that align with your intended start date and entry qualifications.",
      },
      {
        title: "What you will find",
        body: "Program summaries include academic focus, progression patterns, and the kinds of practical experiences attached to the curriculum.",
      },
    ],
    primaryAction: { label: "Browse Courses", href: "/admissions/courses" },
    secondaryAction: {
      label: "Study at University Application Portal",
      href: "/study/courses-programs",
    },
  },
  {
    slug: "academic-calendar",
    title: "Academic Calendar",
    category: "Academics",
    excerpt:
      "Semester dates, assessment windows, and registration checkpoints.",
    overview:
      "The academic calendar brings together the dates students and applicants use most often when planning enrollment, assessments, and campus activity.",
    highlights: [
      "Covers semester starts, examinations, and breaks.",
      "Includes key admissions and registration windows.",
      "Useful for students, parents, and academic advisors.",
    ],
    sections: [
      {
        title: "Planning ahead",
        body: "Use the calendar early so accommodation, travel, and course registration decisions line up with deadlines instead of reacting to them later in the term.",
      },
      {
        title: "Best paired with",
        body: "Applicants normally review the calendar together with admissions lists, fees guidance, and the student portal so every milestone is visible in one planning pass.",
      },
    ],
    primaryAction: { label: "See Admissions Lists", href: "/admissions/lists" },
    secondaryAction: {
      label: "Open Student Hub",
      href: "/quick-links/student-portal",
    },
  },
  {
    slug: "library-portal",
    title: "Library Portal",
    category: "Academics",
    excerpt:
      "Search journals, reserve digital resources, and find research support.",
    overview:
      "The library portal is the fastest path to journals, e-books, research databases, and guidance from subject librarians.",
    highlights: [
      "Digital access to journals, books, and institutional repositories.",
      "Support for referencing, discovery, and literature searches.",
      "Useful across coursework, dissertations, and faculty research.",
    ],
    sections: [
      {
        title: "Research support",
        body: "Students can use the portal to build reading lists, check subject resources, and identify librarian support when preparing large projects or theses.",
      },
      {
        title: "Access expectations",
        body: "Most digital services are organized through institutional credentials and are easiest to navigate when you begin from your program or subject area.",
      },
    ],
    primaryAction: { label: "Explore Research", href: "/research" },
    secondaryAction: {
      label: "IT Help Desk",
      href: "/quick-links/it-help-desk",
    },
  },
  {
    slug: "exam-results",
    title: "Exam Results",
    category: "Academics",
    excerpt:
      "Understand release timelines, transcript access, and escalation routes.",
    overview:
      "Exam results guidance explains where results are published, when updates typically happen, and how transcript or correction requests are handled.",
    highlights: [
      "Covers publication timing and review workflow.",
      "Links results support with registrar and student services.",
      "Explains when to use transcripts, queries, and appeals.",
    ],
    sections: [
      {
        title: "Release pattern",
        body: "Results usually follow departmental verification windows, so students should account for approval cycles before expecting final publication in the portal.",
      },
      {
        title: "Support routes",
        body: "Queries should normally begin with the student portal or registrar-facing guidance before escalating to departments or formal review channels.",
      },
    ],
    primaryAction: {
      label: "Open Student Portal",
      href: "/quick-links/student-portal",
    },
    secondaryAction: {
      label: "Academic Registrar",
      href: "/study/academic-registrar",
    },
  },
  {
    slug: "student-portal",
    title: "Student Portal",
    category: "Student Services",
    excerpt:
      "Registration, schedules, fee status, and student-facing academic tools.",
    overview:
      "The student portal is the operational home base for enrolled students managing registration, term status, and day-to-day academic administration.",
    highlights: [
      "Central access for registration, fee visibility, and records.",
      "Useful alongside academic calendar and support services.",
      "Acts as the first stop for many student workflows.",
    ],
    sections: [
      {
        title: "Core workflows",
        body: "Students typically use the portal to confirm term registration, review academic standing, and keep pace with timetable and records milestones.",
      },
      {
        title: "When to look elsewhere",
        body: "More detailed guidance for scholarships, international support, or IT access usually lives in dedicated service pages that complement the portal rather than replace it.",
      },
    ],
    primaryAction: { label: "Student Life", href: "/students" },
    secondaryAction: {
      label: "Academic Calendar",
      href: "/quick-links/academic-calendar",
    },
  },
  {
    slug: "student-organizations",
    title: "Student Organizations",
    category: "Student Services",
    excerpt:
      "Clubs, societies, leadership opportunities, and campus community life.",
    overview:
      "Student organizations help learners build community, take leadership roles, and connect academic interests to public engagement.",
    highlights: [
      "Covers societies, clubs, and representative structures.",
      "Useful for leadership development and peer connection.",
      "Often pairs well with event and volunteer opportunities.",
    ],
    sections: [
      {
        title: "Why it matters",
        body: "Campus organizations are often where students build confidence, organize projects, and discover mentors or collaborators outside their home department.",
      },
      {
        title: "Best next step",
        body: "Prospective and current students usually combine this with upcoming events and student-life content to understand how involvement looks in practice.",
      },
    ],
    primaryAction: { label: "Visit Students Page", href: "/students" },
    secondaryAction: {
      label: "Upcoming Events",
      href: "/quick-links/upcoming-events",
    },
  },
  {
    slug: "health-safety",
    title: "Health & Safety",
    category: "Student Services",
    excerpt:
      "Campus health support, incident pathways, and student wellbeing guidance.",
    overview:
      "Health and safety guidance helps students understand everyday support services, urgent response pathways, and the institutional expectations that keep campus environments safe.",
    highlights: [
      "Combines wellbeing guidance with urgent-response pathways.",
      "Useful for students, parents, and residence staff.",
      "Links directly with emergency and contact resources.",
    ],
    sections: [
      {
        title: "Daily support",
        body: "Most students use this resource to understand clinic access, wellbeing support, and practical safety expectations for residence, travel, and campus activities.",
      },
      {
        title: "Urgent situations",
        body: "When issues are time-sensitive, health and safety guidance should be used together with emergency contacts so escalation happens through the correct response channel immediately.",
      },
    ],
    primaryAction: {
      label: "Emergency Contacts",
      href: "/quick-links/emergency-contacts",
    },
    secondaryAction: {
      label: "Contact the Team",
      href: "/quick-links/contact-us",
    },
  },
  {
    slug: "it-help-desk",
    title: "IT Help Desk",
    category: "Student Services",
    excerpt:
      "Account access, platform support, device setup, and service recovery help.",
    overview:
      "The IT help desk guide explains where to start when access issues affect classes, research platforms, email, or digital coursework.",
    highlights: [
      "Supports account access, device setup, and academic systems.",
      "Best first stop for platform and login issues.",
      "Connects technical support to student-facing workflows.",
    ],
    sections: [
      {
        title: "Typical requests",
        body: "Students and staff usually begin here for password resets, platform troubleshooting, course access issues, and connectivity guidance before escalating service disruptions.",
      },
      {
        title: "Working efficiently",
        body: "Requests move faster when they include the affected service, device context, and the exact step where the workflow failed.",
      },
    ],
    primaryAction: {
      label: "Library Portal",
      href: "/quick-links/library-portal",
    },
    secondaryAction: { label: "Contact Us", href: "/quick-links/contact-us" },
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    category: "Contact & Directions",
    excerpt:
      "Admissions, general inquiries, department routing, and visit planning.",
    overview:
      "Use this guide when you need to reach the right office quickly, whether the topic is admissions, study planning, events, or support services.",
    highlights: [
      "Useful starting point for general inquiries and routing.",
      "Pairs with directory and visit guidance.",
      "Good entry point for applicants and parents.",
    ],
    sections: [
      {
        title: "Who should start here",
        body: "If you are not yet sure which department owns your issue, start here and route the conversation only after the institution understands your context and deadline.",
      },
      {
        title: "Best companion resources",
        body: "Prospective students often pair contact guidance with how-to-apply, fees, and visit information to reduce unnecessary back-and-forth.",
      },
    ],
    primaryAction: { label: "How to Apply", href: "/admissions/how-to-apply" },
    secondaryAction: { label: "Visit Institute", href: "/about/visit" },
  },
  {
    slug: "directory",
    title: "Directory",
    category: "Contact & Directions",
    excerpt:
      "Locate offices, faculties, and the right departmental contact points.",
    overview:
      "The directory guide helps users identify the correct office before making contact, which is especially useful when a question touches a specific college or administrative team.",
    highlights: [
      "Useful when the subject area is known but the exact office is not.",
      "Reduces misrouted inquiries and delayed follow-up.",
      "Works well with contact and campus visit planning.",
    ],
    sections: [
      {
        title: "How it is used",
        body: "Directory lookups are most helpful when you know the college, service area, or kind of issue you need to resolve but do not yet know the exact unit or person.",
      },
      {
        title: "When not to use it",
        body: "For broad admissions or visit questions, general contact guidance is usually the faster route because the request can then be triaged centrally.",
      },
    ],
    primaryAction: {
      label: "General Contact",
      href: "/quick-links/contact-us",
    },
    secondaryAction: { label: "Campus Map", href: "/quick-links/campus-map" },
  },
  {
    slug: "campus-map",
    title: "Campus Map",
    category: "Contact & Directions",
    excerpt:
      "Buildings, arrival points, parking zones, and visit planning notes.",
    overview:
      "The campus map guide helps first-time visitors and returning students orient themselves around teaching spaces, support offices, and arrival routes.",
    highlights: [
      "Best for open days, meetings, and first-semester navigation.",
      "Pairs well with visit planning and event guidance.",
      "Useful for transport and accessibility preparation.",
    ],
    sections: [
      {
        title: "Before you travel",
        body: "Check arrival timing, parking assumptions, and the building you need first. Doing that early prevents same-day delays and helps visitors choose the right entrance or transport option.",
      },
      {
        title: "Common use cases",
        body: "Campus maps are most commonly used for open days, interviews, department visits, and early-semester orientation when people are still learning the campus layout.",
      },
    ],
    primaryAction: { label: "Visit Institute", href: "/about/visit" },
    secondaryAction: {
      label: "Upcoming Events",
      href: "/quick-links/upcoming-events",
    },
  },
  {
    slug: "forms-documents",
    title: "Forms & Documents",
    category: "Contact & Directions",
    excerpt:
      "Application materials, institutional forms, and document planning guidance.",
    overview:
      "This guide helps applicants and students identify which documents usually matter most for admissions, records, and service requests.",
    highlights: [
      "Useful for admissions and administrative preparation.",
      "Encourages early document collection.",
      "Pairs naturally with how-to-apply and registrar guidance.",
    ],
    sections: [
      {
        title: "Planning your pack",
        body: "Forms move faster when applicants collect transcripts, identity documents, and program-specific evidence well before deadline pressure begins.",
      },
      {
        title: "Records workflows",
        body: "Students often return to this guide later for records requests, correction processes, and supporting documents tied to academic administration.",
      },
    ],
    primaryAction: { label: "How to Apply", href: "/admissions/how-to-apply" },
    secondaryAction: {
      label: "Academic Registrar",
      href: "/study/academic-registrar",
    },
  },
  {
    slug: "upcoming-events",
    title: "Upcoming Events",
    category: "Campus Life",
    excerpt:
      "Open days, public lectures, academic conferences, and community events.",
    overview:
      "Upcoming events help prospective students, current learners, alumni, and partners decide when to engage the campus in person or online.",
    highlights: [
      `Open Day ${currentYear} on April 15, ${currentYear}.`,
      `Research Symposium on April 22, ${currentYear}.`,
      `International Culture Week runs May 18 to May 24, ${currentYear}.`,
    ],
    sections: [
      {
        title: "Best use of the calendar",
        body: "Choose events based on your current decision stage. Applicants often prioritize open days and admissions briefings, while partners and researchers look for specialist forums and symposiums.",
      },
      {
        title: "Practical planning",
        body: "Once an event is relevant, pair this guide with campus map and contact pages so venue, arrival, and registration questions are resolved before the day itself.",
      },
    ],
    primaryAction: { label: "News & Events", href: "/news" },
    secondaryAction: { label: "Campus Map", href: "/quick-links/campus-map" },
  },
  {
    slug: "jobs-careers",
    title: "Jobs & Careers",
    category: "Careers",
    excerpt:
      "Career pathways, internships, placements, and professional readiness.",
    overview:
      "Jobs and careers guidance helps students connect classroom work to employability, placement opportunities, and post-study planning.",
    highlights: [
      "Useful for internships, graduate roles, and career planning.",
      "Pairs with student organizations and employer events.",
      "Relevant to both current students and alumni.",
    ],
    sections: [
      {
        title: "From study to work",
        body: "Career planning is most effective when it starts early, with students using projects, societies, and placements to build a clear evidence base for applications.",
      },
      {
        title: "Support model",
        body: "Students generally combine careers guidance with faculty mentorship and opportunity briefings rather than treating employability as a separate activity.",
      },
    ],
    primaryAction: {
      label: "Research Opportunities",
      href: "/research/opportunities",
    },
    secondaryAction: { label: "Student Services", href: "/students" },
  },
  {
    slug: "emergency-contacts",
    title: "Emergency Contacts",
    category: "Safety",
    excerpt:
      "Urgent response pathways, escalation points, and essential readiness guidance.",
    overview:
      "Emergency contacts guidance exists for time-sensitive situations where a clear escalation path matters more than navigating a broad service page.",
    highlights: [
      "Use for urgent safety, health, or access issues.",
      "Designed to reduce delay during escalation.",
      "Pairs with health and safety guidance for non-urgent planning.",
    ],
    sections: [
      {
        title: "When to use this",
        body: "Use emergency routing when a situation is immediate, safety-sensitive, or likely to worsen if handled through normal informational channels.",
      },
      {
        title: "After immediate response",
        body: "Once the urgent risk is contained, health and safety or general contact routes can be used for follow-up support, reporting, and recovery planning.",
      },
    ],
    primaryAction: {
      label: "Health & Safety",
      href: "/quick-links/health-safety",
    },
    secondaryAction: { label: "Contact Us", href: "/quick-links/contact-us" },
  },
];

export const getResourceGuideBySlug = (slug: string) =>
  resourceGuides.find((guide) => guide.slug === slug);
