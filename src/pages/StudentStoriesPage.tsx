import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote, ArrowRight, Heart, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import storiesHero from "@/assets/stories-hero.jpg";
import storySamuel from "@/assets/story-samuel.jpg";
import storyGrace from "@/assets/story-grace.jpg";
import storyEsther from "@/assets/story-esther.jpg";
import tailoringBusiness from "@/assets/gallery/tailoring-business.jpg";
import soapProducts from "@/assets/gallery/soap-products.jpg";
import communityMarket from "@/assets/gallery/community-market.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

interface Story {
  name: string;
  age: number;
  program: string;
  graduated: string;
  image: string;
  tag: string;
  quote: string;
  before: string;
  after: string;
  fullStory: string;
}

const stories: Story[] = [
  {
    name: "Mary Nakato",
    age: 29,
    program: "Tailoring & Design",
    graduated: "2022",
    image: tailoringBusiness,
    tag: "Single Mother",
    quote:
      "I joined with nothing — no skills, no income, no hope. Today I own a shop and employ two other women.",
    before:
      "Single mother of three with no marketable skills, relying on relatives for basic needs.",
    after:
      "Runs a tailoring business in Nakawa Market, employs 2 people, pays school fees for all three children.",
    fullStory:
      "Mary came to University Application Portal after her husband left the family. With three children under age eight, she had no way to earn income. A community elder referred her to our tailoring program. During the six-month course, Mary discovered a natural talent for design. She practiced evenings and weekends, creating school uniforms for the local primary school. After graduating, she received a start-up kit with a sewing machine and basic materials. Within four months, she had enough regular customers to rent a small shop space. Two years later, Mary employs two other women from the program and is paying school fees for all her children.",
  },
  {
    name: "Samuel Opio",
    age: 23,
    program: "Electrical Installation",
    graduated: "2023",
    image: storySamuel,
    tag: "Vulnerable Youth",
    quote:
      "I went from doing odd jobs for pennies to being a lead electrician. This training gave me a future.",
    before:
      "School dropout doing casual labour for minimal pay, no clear future or stable income.",
    after:
      "Lead electrician at a construction firm, mentors youth in his village, earns a stable salary.",
    fullStory:
      "Samuel dropped out of school at 15 when his family could no longer afford fees. For three years, he survived on casual labour — carrying bricks, digging ditches — earning less than $2 a day. A friend told him about the free electrical installation course at University Application Portal. Samuel was hesitant at first, but the promise of real skills drew him in. He excelled in the program, particularly in industrial wiring. The instructors connected him with a construction firm for his practical placement. The company was so impressed they hired him permanently. Within a year, Samuel was promoted to lead electrician. He now returns to the institute on weekends to mentor new students.",
  },
  {
    name: "Grace Achieng",
    age: 21,
    program: "Welding & Fabrication",
    graduated: "2023",
    image: storyGrace,
    tag: "Breaking Barriers",
    quote:
      "People said welding is not for women. I proved them wrong. Now I teach other girls they can do it too.",
    before:
      "Orphaned at 16, living with distant relatives, told women cannot do technical work.",
    after:
      "Certified welder, works on construction projects, advocates for women in trades.",
    fullStory:
      "When Grace told her relatives she wanted to learn welding, they laughed. 'That's men's work,' they said. But Grace had watched welders on construction sites since she was a child and knew she could do it. At University Application Portal, she was the only woman in her welding class. The first weeks were tough — some classmates questioned whether she belonged. But Grace's determination and skill quickly earned respect. She graduated top of her class and now works on construction projects across Kampala. She regularly visits schools to encourage young girls to consider technical trades, and has inspired four other women to enrol in the welding program.",
  },
  {
    name: "Esther Kemigisha",
    age: 26,
    program: "Hairdressing",
    graduated: "2022",
    image: storyEsther,
    tag: "Entrepreneur",
    quote:
      "I started with one chair borrowed from the institute. Now I have a salon with five stations.",
    before:
      "Unemployed for two years after completing secondary school, no capital to start a business.",
    after:
      "Owns a salon with five stations, employs three stylists, trains new graduates.",
    fullStory:
      "Esther completed secondary school but couldn't afford university. Two years of unemployment followed, during which she grew increasingly discouraged. A friend who had graduated from University Application Portal convinced her to try the hairdressing program. Esther discovered a passion for hair styling and customer service. She practised on anyone willing — neighbours, fellow students, even instructors. After graduating, the institute lent her a salon chair and basic supplies. She started doing hair from her home, building a loyal customer base through word of mouth. Within 18 months she had saved enough to rent a proper space. Today, Esther's salon has five styling stations and employs three other graduates from the program.",
  },
  {
    name: "Joseph Ssemakula",
    age: 34,
    program: "Soap Making",
    graduated: "2023",
    image: soapProducts,
    tag: "Community Leader",
    quote:
      "Soap making taught me business, not just a skill. I supply three shops now and train others in my village.",
    before:
      "Subsistence farmer with unpredictable seasonal income, struggling to feed his family.",
    after:
      "Produces and sells soap to three local shops, trains community members, stable year-round income.",
    fullStory:
      "Joseph was a farmer whose income depended entirely on the rains. In bad seasons, his family went hungry. He heard about the soap-making course on a community radio programme and decided to try something new. The three-month course taught him not just soap production but business fundamentals — costing, packaging, marketing. After graduating, he started making soap at home using locally available ingredients. He went door to door at first, then convinced a small shop to stock his products. Word spread about the quality, and two more shops placed regular orders. Joseph now runs weekly soap-making workshops for others in his community, creating a ripple effect of income generation.",
  },
  {
    name: "Amina Watende",
    age: 20,
    program: "Beauty Therapy",
    graduated: "2024",
    image: communityMarket,
    tag: "Young Achiever",
    quote:
      "At 20, I already have my own income. My mother cried when I gave her money for the first time.",
    before:
      "Dropped out of school at 16, no prospects, living in poverty with her widowed mother.",
    after:
      "Works at a beauty spa in Kampala, sends money home monthly, saving to open her own business.",
    fullStory:
      "Amina's father passed away when she was 14, and by 16 she had dropped out of school because her mother couldn't afford fees. She spent two years helping her mother sell vegetables at a roadside stand, earning barely enough for food. A social worker referred her to the beauty therapy program at University Application Portal. Amina was nervous — she had never used beauty products herself. But the structured learning environment and supportive instructors helped her flourish. She specialised in skincare and nail art. A high-end spa in Kampala recruited her straight from her practical placement. She now sends money home every month and is saving to eventually open her own small beauty business.",
  },
];

type StudentStoryDoc = {
  id: string;
  title: string;
  student_name: string;
  program?: string;
  graduation_year?: number;
  content?: string;
  image_url?: string;
};

const StudentStoriesPage = () => {
  const navigate = useNavigate();
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const [portalName] = useState("University Application Portal");
  const storiesRef = useRef<HTMLDivElement>(null);
  const { data: storyDocs } = useContentCollection<StudentStoryDoc>(
    "student_stories",
    [],
    { orderBy: { field: "published_date", direction: "desc" } },
  );

  const dynamicStories: Story[] =
    storyDocs.length > 0
      ? storyDocs.map((doc, index) => {
          const content = (
            doc.content || "Story details will be published soon."
          ).replace(/University Application Portal/g, portalName);
          return {
            name: doc.student_name,
            age: 0,
            program: doc.program || "Vocational Training",
            graduated: doc.graduation_year
              ? String(doc.graduation_year)
              : "Recent",
            image:
              doc.image_url ||
              [
                tailoringBusiness,
                storySamuel,
                storyGrace,
                storyEsther,
                soapProducts,
                communityMarket,
              ][index % 6],
            tag: "Featured Story",
            quote: doc.title,
            before: "Learner preparing for better livelihood opportunities.",
            after: "Graduate applying practical skills for income and impact.",
            fullStory: content,
          };
        })
      : stories.map((story) => ({
          ...story,
          fullStory: story.fullStory.replace(/University Application Portal/g, portalName),
        }));

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stories-hero-text > *",
        { y: 60, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        },
      );

      if (storiesRef.current) {
        gsap.fromTo(
          storiesRef.current.querySelectorAll(".story-card"),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: storiesRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      gsap.utils.toArray<HTMLElement>(".section-heading").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  const toggleStory = (index: number) => {
    setExpandedStory(expandedStory === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[55vh] flex items-end overflow-hidden">
        <img
          src={storiesHero}
          alt="Graduate success"
          className="absolute inset-0 w-full h-full object-cover rounded-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20 rounded-none" />
        <div className="relative z-10 px-8 md:px-16 pb-20 pt-40 stories-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-5 opacity-0">
            Student Stories
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-6 opacity-0">
            Real People.
            <br />
            <em className="text-accent">Real Transformation.</em>
          </h1>
          <p className="font-body text-base text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            Behind every statistic is a person whose life was changed by
            practical skills and the belief that a better future is possible.
          </p>
        </div>
      </div>

      {/* Stories */}
      <section className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Their Journeys
          </p>
          <h2 className="section-heading font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            From Hardship
            <br />
            To Hope
          </h2>
        </div>

        <div ref={storiesRef} className="space-y-8 max-w-5xl">
          {dynamicStories.map((story, i) => (
            <div
              key={story.name}
              className="story-card opacity-0 group border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-500"
            >
              <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]">
                {/* Image */}
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 bg-accent/90 text-accent-foreground rounded-full backdrop-blur-sm">
                      {story.tag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <div>
                      <h3 className="font-heading text-2xl md:text-3xl font-light text-foreground">
                        {story.name}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        {story.program} · Graduated {story.graduated} · Age{" "}
                        {story.age}
                      </p>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="relative mb-6">
                    <Quote size={16} className="text-accent/40 mb-2" />
                    <p className="font-heading text-lg md:text-xl font-light text-foreground/90 leading-relaxed italic">
                      {story.quote}
                    </p>
                  </div>

                  {/* Before / After */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-destructive/60 mb-2">
                        Before
                      </p>
                      <p className="font-body text-sm text-foreground/70 leading-relaxed">
                        {story.before}
                      </p>
                    </div>
                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-accent/80 mb-2">
                        After
                      </p>
                      <p className="font-body text-sm text-foreground/70 leading-relaxed">
                        {story.after}
                      </p>
                    </div>
                  </div>

                  {/* Expandable full story */}
                  <button
                    onClick={() => toggleStory(i)}
                    className="flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-accent hover:text-accent/80 transition-colors duration-300 mt-auto"
                  >
                    {expandedStory === i ? "Read Less" : "Read Full Story"}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${expandedStory === i ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expandedStory === i && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {story.fullStory}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-8 md:px-16 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Be Part of the Story
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-8">
            Help Write the Next
            <br />
            Success Story
          </h2>
          <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-10 max-w-lg mx-auto">
            Every student who walks through our doors has the potential to
            transform their life and their community. Your support makes it
            possible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/donate")}
              className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
            >
              <Heart size={16} className="fill-current" />
              Sponsor a Student
            </button>
            <button
              onClick={() => navigate("/programs")}
              className="group flex items-center gap-2 px-10 py-4 border border-primary-foreground/40 text-primary-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift"
            >
              View Programs
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StudentStoriesPage;
