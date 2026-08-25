export type NewsArticle = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: string;
  body: string[];
  highlights: string[];
};

const currentYear = new Date().getFullYear();

export const newsArticles: NewsArticle[] = [
  {
    slug: "university-application-portal-top-200-global-ranking",
    title: "University Application Portal ranks among the top 200 universities globally",
    date: `March 8, ${currentYear}`,
    category: "Institutional",
    excerpt:
      "For the first time in its history, University Application Portal has entered the top 200 of the World University Rankings, reflecting sustained investment in research, faculty excellence, and global partnerships.",
    readTime: "6 min read",
    body: [
      "The latest rankings cite University Application Portal's research output, graduate employability, and international collaboration as the main drivers behind its move into the global top tier. The result follows several years of strategic investment in research labs, scholarship support, and faculty recruitment.",
      "Institution leaders said the milestone is important not only as a prestige marker, but as evidence that the institution's long-term academic strategy is producing measurable outcomes. Particular recognition was given to interdisciplinary research centers, industry partnerships, and student support services that improved retention and progression rates.",
      "The university now plans to use the momentum to strengthen postgraduate research, expand international exchange programs, and deepen community-facing innovation projects. Faculty and student leaders both described the ranking as a validation of work already underway rather than a finish line.",
    ],
    highlights: [
      "Research citations and international partnerships recorded the strongest year-over-year growth.",
      "Graduate employability remained above 90 percent across several flagship colleges.",
      "Leadership is prioritizing research funding, student mobility, and community innovation for the next cycle.",
    ],
  },
  {
    slug: "ai-research-lab-opens-on-campus",
    title: "New $12M AI research lab opens on campus",
    date: `February 28, ${currentYear}`,
    category: "Research",
    excerpt:
      "The new facility will house 60 researchers and focus on ethical AI applications for healthcare, agriculture, and public systems.",
    readTime: "4 min read",
    body: [
      "The new AI lab brings together faculty from computing, medicine, agriculture, and public policy to develop practical systems with clear social value. The facility includes collaborative workspaces, model evaluation suites, and a secure environment for applied research with institutional partners.",
      "Researchers said the lab is designed to support both frontier experimentation and real-world deployment. Initial projects include diagnostic support tools for regional clinics, crop risk forecasting systems, and public-service decision support for local agencies.",
      "The institute expects the lab to anchor new postgraduate fellowships and short courses for working professionals who want to build skills in responsible AI design and evaluation.",
    ],
    highlights: [
      "The first cohort includes 60 resident researchers and fellows.",
      "Early projects span healthcare triage, crop forecasting, and public-service analytics.",
      "The facility will also host industry training and postgraduate research residencies.",
    ],
  },
  {
    slug: "student-startup-secures-seed-funding",
    title: "Student startup raises $2.4M in seed funding",
    date: `February 15, ${currentYear}`,
    category: "Innovation",
    excerpt:
      "AgriSense, founded by two University Application Portal engineering students, secured backing for its precision agriculture platform after pilot results with farming cooperatives.",
    readTime: "5 min read",
    body: [
      "AgriSense began as a capstone project focused on affordable field monitoring for smallholder farmers. After successful pilots across three districts, the founding team refined the product into a decision-support platform that combines sensing, forecasting, and advisory workflows.",
      "The new financing will support product engineering, regional expansion, and a structured internship program for University Application Portal students interested in agricultural technology. Faculty mentors described the round as an example of what happens when applied research and entrepreneurship operate closely together.",
      "University innovation staff said the company will continue to work with campus labs while scaling its field network and validation programs with new partners.",
    ],
    highlights: [
      "The startup evolved from a student capstone into a field-tested commercial platform.",
      "New funding will expand engineering, deployments, and internship capacity.",
      "The company will continue collaborating with university labs during scale-up.",
    ],
  },
  {
    slug: "spring-graduation-celebrates-3200",
    title: "Spring graduation ceremony celebrates 3,200 graduates",
    date: `January 30, ${currentYear}`,
    category: "Campus",
    excerpt:
      "The largest graduating class in university history included students from 48 countries and every academic college.",
    readTime: "4 min read",
    body: [
      "This year's graduation ceremony marked the largest class in the institute's history, with graduates representing a wide mix of disciplines and national backgrounds. University leadership emphasized resilience, public service, and practical scholarship throughout the event.",
      "Student speakers reflected on the value of interdisciplinary learning and the confidence built through project-based coursework, internships, and faculty mentorship. Several graduates highlighted research placements and entrepreneurship programs as defining experiences.",
      "The institute said the class profile signals both growing demand and improved academic progression, especially across STEM, health, and business programs.",
    ],
    highlights: [
      "The class included graduates from 48 countries.",
      "Project-based learning and internships featured prominently in student reflections.",
      "Leadership tied the milestone to growth in academic progression and student support.",
    ],
  },
  {
    slug: "mit-joint-research-program-launches",
    title: "Partnership with MIT launches joint research program",
    date: `January 18, ${currentYear}`,
    category: "Partnerships",
    excerpt:
      "A five-year collaboration will support quantum computing research, visiting scholars, and graduate exchange opportunities.",
    readTime: "5 min read",
    body: [
      "The new agreement creates a multi-year framework for shared research agendas, visiting scholar placements, and co-supervised graduate work. Initial emphasis will be on quantum systems, advanced materials, and interdisciplinary methods training.",
      "Faculty involved in the program said the value lies as much in research culture as in output. Shared seminars, technical workshops, and structured exchanges are expected to strengthen collaboration habits and open new publication pathways for emerging researchers.",
      "The partnership also includes planning for public lectures and applied innovation sessions designed to connect research teams with industry and government stakeholders.",
    ],
    highlights: [
      "The agreement covers research, scholar exchange, and graduate supervision.",
      "Quantum systems and advanced materials are the first priority areas.",
      "The program includes public-facing lectures and collaboration forums.",
    ],
  },
  {
    slug: "sustainability-initiative-cuts-emissions-40",
    title: "Campus sustainability initiative reduces emissions by 40 percent",
    date: `January 5, ${currentYear}`,
    category: "Sustainability",
    excerpt:
      "Solar installations, transport changes, and energy-efficiency upgrades pushed the campus sharply closer to its carbon-neutral goal.",
    readTime: "4 min read",
    body: [
      "The campus sustainability office reported a 40 percent emissions reduction driven by solar deployment, building retrofits, and operational changes in transport and waste handling. The progress keeps the institute on track toward its 2030 carbon-neutral target.",
      "Leaders credited the gains to a combination of capital investment and behavior change, including updated building management systems, student-led awareness campaigns, and revised procurement practices.",
      "The next phase will focus on fleet electrification, water systems, and closer integration between sustainability planning and academic research projects.",
    ],
    highlights: [
      "Solar generation and building upgrades drove most of the reduction.",
      "Student-led campaigns supported changes in day-to-day operations.",
      "Next steps include electrification and stronger research integration.",
    ],
  },
  {
    slug: "faculty-member-wins-macarthur-fellowship",
    title: "Faculty member wins prestigious MacArthur Fellowship",
    date: "December 12, 2025",
    category: "Faculty",
    excerpt:
      "Professor Nadia Ochieng was recognized for groundbreaking work in tropical disease genomics and translational public-health research.",
    readTime: "3 min read",
    body: [
      "Professor Nadia Ochieng's fellowship recognizes a body of work that combines genomic analysis with practical public-health interventions. Her research has improved disease surveillance and informed policy across several national health systems.",
      "Colleagues described the award as both personal recognition and a signal that rigorous, locally grounded research can shape global conversations. Students in her lab said the fellowship reflects a mentoring culture that expects scientific excellence and public relevance.",
      "The institute plans to expand doctoral support in the genomics program and use the moment to deepen collaborative research pipelines across medicine, data science, and policy.",
    ],
    highlights: [
      "The fellowship honors work connecting genomics and public-health implementation.",
      "Students and colleagues emphasized Professor Ochieng's mentorship impact.",
      "The university expects the recognition to strengthen doctoral research capacity.",
    ],
  },
];

export const featuredNewsSlug = "university-application-portal-top-200-global-ranking";

export const getNewsArticleBySlug = (slug: string) =>
  newsArticles.find((article) => article.slug === slug);
