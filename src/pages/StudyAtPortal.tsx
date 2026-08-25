import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { studyLinks } from "@/lib/studyLinks";

const StudyAtPortal = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 md:pt-36 px-8 md:px-16 pb-20">
        <section className="max-w-6xl mx-auto">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Study at University Application Portal
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-foreground leading-[0.95] mb-6">
            Build your future through rigorous, hands-on learning.
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
            With over 143 programs across 10 colleges setting a global standard
            for excellence, the University Application Portal emphasizes learning by doing.
            Explore admissions pathways, fees, scholarships, and all study
            resources below.
          </p>
        </section>

        <section className="max-w-6xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {studyLinks.map((item, i) => (
            <Link
              key={item.slug}
              to={`/study/${item.slug}`}
              className="group relative border border-border rounded-[20px] p-5 bg-background overflow-hidden transition-all duration-500 hover:border-accent/50 hover:bg-accent/5"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
              <h2 className="relative font-heading text-2xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                {item.title}
              </h2>
              <p className="relative font-body text-sm text-muted-foreground mt-2 leading-relaxed group-hover:text-foreground transition-colors duration-300">
                {item.summary}
              </p>
              <span className="relative mt-4 inline-flex items-center font-body text-xs tracking-[0.15em] uppercase text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400">
                Open Page
              </span>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StudyAtPortal;
