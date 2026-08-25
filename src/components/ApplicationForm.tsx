import { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import gsap from "gsap";
import { ArrowRight, ArrowLeft, Check, ChevronDown } from "lucide-react";

const currentYear = new Date().getFullYear();

const applicationSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Invalid phone number").max(20),
  dateOfBirth: z.string().min(1, "Required"),
  nationality: z.string().trim().min(1, "Required").max(100),
  address: z.string().trim().min(1, "Required").max(500),
  city: z.string().trim().min(1, "Required").max(100),
  postalCode: z.string().trim().min(1, "Required").max(20),
  country: z.string().trim().min(1, "Required").max(100),
  program: z.string().min(1, "Please select a program"),
  startDate: z.string().min(1, "Required"),
  previousInstitution: z.string().trim().min(1, "Required").max(200),
  highestQualification: z.string().min(1, "Required"),
  gpa: z.string().trim().min(1, "Required").max(10),
  personalStatement: z
    .string()
    .trim()
    .min(50, "Minimum 50 characters")
    .max(5000),
  howDidYouHear: z.string().min(1, "Required"),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

type ApplicationData = z.infer<typeof applicationSchema>;

const programs = [
  "Philosophy & Ethics",
  "Theoretical Physics",
  "Comparative Literature",
  "Biomedical Engineering",
  "Mathematical Sciences",
  "Architecture & Urban Design",
];

const qualifications = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Other",
];

const hearAbout = [
  "University Website",
  "Social Media",
  "Education Fair",
  "Recommendation",
  "Publication",
  "Other",
];

interface ApplicationFormProps {
  onClose: () => void;
}

// Animated floating-label input
const FloatingInput = ({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const hasValue = value.length > 0;

  useEffect(() => {
    if (lineRef.current) {
      gsap.to(lineRef.current, {
        scaleX: focused ? 1 : 0,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, [focused]);

  return (
    <div className="relative group">
      <label
        className={`absolute left-0 font-body transition-all duration-500 pointer-events-none ${
          focused || hasValue
            ? "text-[10px] tracking-[0.25em] uppercase -top-2 text-accent"
            : "text-sm top-3 text-muted-foreground"
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent border-b border-border py-3 pt-4 font-body text-sm text-foreground focus:outline-none transition-colors duration-500"
      />
      {/* Animated accent line */}
      <div
        ref={lineRef}
        className="absolute bottom-0 left-0 w-full h-[2px] bg-accent origin-left scale-x-0"
      />
      {error && (
        <p className="font-body text-xs text-destructive mt-1.5 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

// Animated select
const FloatingSelect = ({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  error?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const hasValue = value.length > 0;

  useEffect(() => {
    if (lineRef.current) {
      gsap.to(lineRef.current, {
        scaleX: focused ? 1 : 0,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, [focused]);

  return (
    <div className="relative group">
      <label
        className={`absolute left-0 font-body transition-all duration-500 pointer-events-none z-10 ${
          focused || hasValue
            ? "text-[10px] tracking-[0.25em] uppercase -top-2 text-accent"
            : "text-sm top-3 text-muted-foreground"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent border-b border-border py-3 pt-4 font-body text-sm text-foreground focus:outline-none appearance-none cursor-pointer transition-colors duration-500 pr-8"
        >
          <option value=""></option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className={`absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-300 pointer-events-none ${
            focused ? "rotate-180 text-accent" : ""
          }`}
        />
      </div>
      <div
        ref={lineRef}
        className="absolute bottom-0 left-0 w-full h-[2px] bg-accent origin-left scale-x-0"
      />
      {error && (
        <p className="font-body text-xs text-destructive mt-1.5 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

const ApplicationForm = ({ onClose }: ApplicationFormProps) => {
  const [formData, setFormData] = useState<Partial<ApplicationData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [portalName] = useState("University Application Portal");
  const stepContentRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const updateField = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const steps = [
    {
      title: "Personal Information",
      subtitle: "Tell us about yourself",
      fields: [
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "nationality",
      ],
    },
    {
      title: "Your Address",
      subtitle: "Where should we reach you?",
      fields: ["address", "city", "postalCode", "country"],
    },
    {
      title: "Academic Background",
      subtitle: "Your educational journey",
      fields: [
        "program",
        "startDate",
        "previousInstitution",
        "highestQualification",
        "gpa",
      ],
    },
    {
      title: "Personal Statement",
      subtitle: "Share your story",
      fields: ["personalStatement", "howDidYouHear", "agreeTerms"],
    },
  ];

  const validateStep = () => {
    const currentFields = steps[step].fields;
    const stepErrors: Record<string, string> = {};

    const result = applicationSchema.safeParse({
      ...Object.fromEntries(
        currentFields.map((f) => [
          f,
          (formData as Record<string, unknown>)[f] ?? "",
        ]),
      ),
      ...Object.fromEntries(
        Object.keys(applicationSchema.shape)
          .filter((k) => !currentFields.includes(k))
          .map((k) => [
            k,
            k === "agreeTerms"
              ? true
              : k === "personalStatement"
                ? "x".repeat(50)
                : k === "email"
                  ? "a@b.c"
                  : k === "phone"
                    ? "1234567"
                    : k === "dateOfBirth"
                      ? "2000-01-01"
                      : "placeholder",
          ]),
      ),
    });

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (currentFields.includes(field)) {
          stepErrors[field] = err.message;
        }
      });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Animate step transitions
  const animateStepIn = useCallback(() => {
    if (stepContentRef.current) {
      const children = stepContentRef.current.children;
      gsap.fromTo(
        children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.1,
        },
      );
    }
  }, []);

  useEffect(() => {
    if (!submitted) animateStepIn();
  }, [step, submitted, animateStepIn]);

  useEffect(() => {
    if (submitted && successRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        successRef.current.querySelector(".success-icon"),
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" },
      )
        .fromTo(
          successRef.current.querySelector(".success-title"),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.3",
        )
        .fromTo(
          successRef.current.querySelector(".success-text"),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.4",
        )
        .fromTo(
          successRef.current.querySelector(".success-btn"),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.3",
        );
    }
  }, [submitted]);

  const handleNext = () => {
    if (validateStep()) {
      if (stepContentRef.current) {
        gsap.to(stepContentRef.current.children, {
          y: -20,
          opacity: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power2.in",
          onComplete: () => {
            if (step < steps.length - 1) {
              setStep(step + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              setSubmitted(true);
            }
          },
        });
      } else {
        if (step < steps.length - 1) setStep(step + 1);
        else setSubmitted(true);
      }
    }
  };

  const handlePrev = () => {
    if (stepContentRef.current) {
      gsap.to(stepContentRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.in",
        onComplete: () => {
          if (step > 0) setStep(step - 1);
          else onClose();
        },
      });
    } else {
      if (step > 0) setStep(step - 1);
      else onClose();
    }
  };

  const val = (field: string) =>
    (formData as Record<string, string>)[field] ?? "";

  if (submitted) {
    return (
      <div
        ref={successRef}
        className="min-h-screen flex flex-col items-center justify-center px-8 py-32"
      >
        <div className="success-icon w-20 h-20 rounded-full border-2 border-accent flex items-center justify-center mb-12">
          <Check size={32} className="text-accent" />
        </div>
        <h2 className="success-title font-heading text-4xl md:text-6xl font-light text-foreground text-center mb-6 opacity-0">
          Application Received
        </h2>
        <p className="success-text body-text text-muted-foreground text-center max-w-md mb-12 opacity-0">
          Thank you, {formData.firstName}. Your application to the{" "}
          <span className="text-accent">{formData.program}</span> program has
          been submitted. We will be in touch within 10 business days.
        </p>
        <button
          onClick={onClose}
          className="success-btn group relative px-12 py-4 border border-foreground font-body text-sm tracking-[0.3em] uppercase text-foreground overflow-hidden opacity-0"
        >
          <span className="relative z-10 group-hover:text-accent-foreground transition-colors duration-500">
            Return to Site
          </span>
          <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 md:px-16 py-16 md:py-24 max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center font-body text-xs tracking-wide transition-all duration-700 ${
                  i < step
                    ? "border-accent bg-accent text-accent-foreground cursor-pointer"
                    : i === step
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <Check size={14} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </button>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px relative overflow-hidden">
                  <div className="absolute inset-0 bg-border" />
                  <div
                    className="absolute inset-y-0 left-0 bg-accent transition-all duration-700 ease-out"
                    style={{ width: i < step ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step title with animated reveal */}
        <div className="overflow-hidden">
          <h2 className="font-heading text-3xl md:text-5xl font-light text-foreground">
            {steps[step].title}
          </h2>
        </div>
        <p className="body-text text-muted-foreground mt-2">
          {steps[step].subtitle}
        </p>
      </div>

      {/* Step Content */}
      <div ref={stepContentRef}>
        {step === 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <FloatingInput
                label="First Name"
                value={val("firstName")}
                onChange={(v) => updateField("firstName", v)}
                error={errors.firstName}
              />
              <FloatingInput
                label="Last Name"
                value={val("lastName")}
                onChange={(v) => updateField("lastName", v)}
                error={errors.lastName}
              />
              <FloatingInput
                label="Email Address"
                value={val("email")}
                onChange={(v) => updateField("email", v)}
                error={errors.email}
                type="email"
              />
              <FloatingInput
                label="Phone Number"
                value={val("phone")}
                onChange={(v) => updateField("phone", v)}
                error={errors.phone}
                type="tel"
              />
              <FloatingInput
                label="Date of Birth"
                value={val("dateOfBirth")}
                onChange={(v) => updateField("dateOfBirth", v)}
                error={errors.dateOfBirth}
                type="date"
              />
              <FloatingInput
                label="Nationality"
                value={val("nationality")}
                onChange={(v) => updateField("nationality", v)}
                error={errors.nationality}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="md:col-span-2">
                <FloatingInput
                  label="Street Address"
                  value={val("address")}
                  onChange={(v) => updateField("address", v)}
                  error={errors.address}
                />
              </div>
              <FloatingInput
                label="City"
                value={val("city")}
                onChange={(v) => updateField("city", v)}
                error={errors.city}
              />
              <FloatingInput
                label="Postal Code"
                value={val("postalCode")}
                onChange={(v) => updateField("postalCode", v)}
                error={errors.postalCode}
              />
              <div className="md:col-span-2">
                <FloatingInput
                  label="Country"
                  value={val("country")}
                  onChange={(v) => updateField("country", v)}
                  error={errors.country}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="md:col-span-2">
                <FloatingSelect
                  label="Program of Interest"
                  value={val("program")}
                  onChange={(v) => updateField("program", v)}
                  options={programs}
                  error={errors.program}
                />
              </div>
              <FloatingSelect
                label="Preferred Start Date"
                value={val("startDate")}
                onChange={(v) => updateField("startDate", v)}
                options={[
                  `Fall ${currentYear}`,
                  `Spring ${currentYear + 1}`,
                  `Fall ${currentYear + 1}`,
                ]}
                error={errors.startDate}
              />
              <FloatingInput
                label="GPA / Score"
                value={val("gpa")}
                onChange={(v) => updateField("gpa", v)}
                error={errors.gpa}
              />
              <FloatingInput
                label="Previous Institution"
                value={val("previousInstitution")}
                onChange={(v) => updateField("previousInstitution", v)}
                error={errors.previousInstitution}
              />
              <FloatingSelect
                label="Highest Qualification"
                value={val("highestQualification")}
                onChange={(v) => updateField("highestQualification", v)}
                options={qualifications}
                error={errors.highestQualification}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-10">
              <div>
                <label className="font-body text-[10px] tracking-[0.25em] uppercase text-accent mb-2 block">
                  Personal Statement
                </label>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  In no more than 5,000 characters, tell us why you wish to
                  study at University Application Portal and what question drives your intellectual
                  curiosity.
                </p>
                <div className="relative group">
                  <textarea
                    className="w-full bg-transparent border border-border py-4 px-4 font-body text-sm text-foreground min-h-[220px] resize-y focus:outline-none focus:border-accent transition-colors duration-500"
                    value={val("personalStatement")}
                    onChange={(e) =>
                      updateField("personalStatement", e.target.value)
                    }
                    placeholder="Begin writing here..."
                  />
                  <div className="flex justify-between mt-2">
                    <p className="font-body text-xs text-muted-foreground">
                      {val("personalStatement").length} / 5,000 characters
                    </p>
                    {val("personalStatement").length >= 50 && (
                      <span className="font-body text-xs text-accent flex items-center gap-1 animate-fade-in">
                        <Check size={12} /> Minimum met
                      </span>
                    )}
                  </div>
                  {errors.personalStatement && (
                    <p className="font-body text-xs text-destructive mt-1 animate-fade-in">
                      {errors.personalStatement}
                    </p>
                  )}
                </div>
              </div>

              <FloatingSelect
                label="How did you hear about us?"
                value={val("howDidYouHear")}
                onChange={(v) => updateField("howDidYouHear", v)}
                options={hearAbout}
                error={errors.howDidYouHear}
              />

              <div className="flex items-start gap-4 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    updateField("agreeTerms", !formData.agreeTerms)
                  }
                  className={`mt-0.5 w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${
                    formData.agreeTerms
                      ? "border-accent bg-accent"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  {formData.agreeTerms && (
                    <Check
                      size={12}
                      className="text-accent-foreground animate-scale-in"
                    />
                  )}
                </button>
                <label
                  onClick={() =>
                    updateField("agreeTerms", !formData.agreeTerms)
                  }
                  className="font-body text-sm text-foreground/80 leading-relaxed cursor-pointer select-none hover:text-foreground transition-colors duration-500"
                >
                  I confirm that all information provided is accurate and I
                  agree to the terms and conditions of the {portalName}{" "}
                  application process.
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="font-body text-xs text-destructive animate-fade-in">
                  {errors.agreeTerms}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-20 pt-8 border-t border-border">
        <button
          onClick={handlePrev}
          className="group flex items-center gap-3 font-body text-sm tracking-[0.2em] uppercase text-muted-foreground transition-all duration-500 hover:text-foreground"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform duration-500"
          />
          {step > 0 ? "Previous" : "Cancel"}
        </button>
        <button
          onClick={handleNext}
          className="group relative flex items-center gap-3 px-10 py-3 bg-foreground font-body text-sm tracking-[0.3em] uppercase text-background overflow-hidden"
        >
          <span className="relative z-10 transition-colors duration-500 group-hover:text-accent-foreground">
            {step < steps.length - 1 ? "Continue" : "Submit"}
          </span>
          <ArrowRight
            size={16}
            className="relative z-10 group-hover:translate-x-1 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
        </button>
      </div>
    </div>
  );
};

export default ApplicationForm;
