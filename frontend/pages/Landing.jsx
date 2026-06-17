import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Star,
  ShieldCheck,
  Zap,
  Radio,
  PhoneCall,
} from "lucide-react";

/* Brand constants (Swiss-editorial / warm paper) */
const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LIME = "#C7F04A";
const LINE = "rgba(21,23,15,0.12)";

/* Animated number counter, fires on scroll-in */
function Counter({ to, suffix = "", duration = 1500 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Mono eyebrow label */
function Eyebrow({ index, children, light = false }) {
  return (
    <div
      className="font-mono uppercase tracking-[0.25em] flex items-center gap-3"
      style={{ fontSize: "0.7rem", color: light ? "rgba(244,241,234,0.6)" : "#6B6A5C" }}
    >
      <span style={{ color: light ? LIME : GREEN }}>{index}</span>
      <span className="h-px w-8" style={{ background: light ? "rgba(244,241,234,0.3)" : LINE }} />
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Explore", "How it works", "Reviews", "Owners"];

  const testimonials = [
    { name: "Rahul K.", college: "Asansol Engineering College", text: "Found a PG in literally 10 minutes. The live availability feature is a complete game changer." },
    { name: "Priya S.", college: "NIT Durgapur", text: "As a girl, safety was my priority. The verified badges gave me so much peace of mind." },
    { name: "Amit P.", college: "BC Roy Engineering College", text: "Zero brokerage! I saved around ₹8,000 just by contacting the owner directly through StayPoint." },
    { name: "Sneha R.", college: "Durgapur Institute of Tech", text: "The AI picks understood exactly what I wanted. No more endless scrolling and fake listings." },
    { name: "Imran H.", college: "Asansol Engineering College", text: "Booked my room before even reaching the city. Move-in day was completely stress free." },
  ];

  const features = [
    {
      n: "01",
      title: "Every stay, physically verified",
      desc: "Our team visits each PG before it goes live. Real photos, owner KYC, on-site checks — zero scams, full transparency.",
      icon: ShieldCheck,
      tags: ["Real photos","On-site checks"],
    },
    {
      n: "02",
      title: "AI smart picks",
      desc: "Tell us your college and budget. Our model surfaces your best matches in seconds.",
      icon: Zap,
    },
    {
      n: "03",
      title: "Real-time bed availability",
      desc: "Stop calling owners. See exactly which beds are vacant, right now.",
      icon: Radio,
    },
    {
      n: "04",
      title: "One-tap direct connect",
      desc: "Message or call owners directly. No middlemen, no brokerage, no awkward negotiations.",
      icon: PhoneCall,
    },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden antialiased"
      style={{ background: PAPER, color: INK }}
    >
      <style>{`
        ::selection { background: ${GREEN}; color: ${PAPER}; }
        .ff-display { font-family: var(--font-display); font-optical-sizing: auto; }
        .ff-mono { font-family: var(--font-mono); }
        .grain {
          background-image:
            radial-gradient(${GREEN}14 0.5px, transparent 0.5px);
          background-size: 18px 18px;
        }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee { display:flex; width:max-content; animation: marquee 60s linear infinite; }
        .marquee-fast { display:flex; width:max-content; animation: marquee 120s linear infinite; }
        .marquee-fast:hover { animation-play-state: paused; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .float { animation: float 6s ease-in-out infinite; }
      `}</style>


      {/* ====================== HERO ====================== */}
      <section className="relative pt-28 md:pt-32 pb-16 grain">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left — editorial headline */}
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow index="◆">Verified student housing</Eyebrow>
              </Reveal>
              <Reveal delay={0.05}>
                <h1
  className="ff-display mt-7"
  style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)", lineHeight: 0.98, letterSpacing: "-0.03em", fontWeight: 500 }}
>
  Confused where to{" "}
  <span className="italic" style={{ fontWeight: 400 }}>
    find
  </span>{" "}
  the
  <span className="relative whitespace-nowrap">
    {" "}best PG?
    <svg className="absolute left-0 -bottom-2 w-full" height="14" viewBox="0 0 300 14" fill="none" preserveAspectRatio="none">
      <path d="M3 9C70 3 200 1 297 8" stroke={GREEN} strokeWidth="4" strokeLinecap="round" />
    </svg>
  </span>
  
  {/* penguin mascot */}
  <img 
    src="m2.svg" 
    alt="Small Pingu mascot" 
    className="inline-block w-[1.2em] h-[1.2em] object-contain ml-3 md:ml-4 translate-y-1 md:translate-y-2" 
  />
</h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 max-w-md leading-relaxed" style={{ color: "#54533F", fontSize: "1.1rem" }}>
                  StayPoint brings you physically verified PGs with real-time bed availability and
                  budget-fit recommendations — with{" "}
                  <span style={{ color: INK, fontWeight: 600 }}>zero brokerage.</span>
                </p>
              </Reveal>

              {/* Search */}
              <Reveal delay={0.15}>
                <div
                  className="mt-9 flex flex-col sm:flex-row items-stretch gap-2 max-w-lg p-2"
                  style={{ background: PANEL, border: `1px solid ${LINE}` }}
                >
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Search size={18} style={{ color: GREEN }} />
                    <input
                      type="text"
                      placeholder="Enter your college or city…"
                      className="w-full bg-transparent outline-none py-3"
                      style={{ color: INK }}
                    />
                  </div>
                  <Link
                    to="/explore"
                    className="group flex items-center justify-center gap-2 px-7 py-3.5 ff-mono uppercase tracking-[0.15em] transition-colors"
                    style={{ fontSize: "0.74rem", background: INK, color: PAPER }}
                  >
                    Search
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-7 flex items-center gap-6 ff-mono uppercase tracking-[0.18em]" style={{ fontSize: "0.68rem", color: "#6B6A5C" }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
                    50+ live listings
                  </span>
                  <span>100+ students housed</span>
                </div>
              </Reveal>
            </div>

            {/* Right — mascot */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div
                className="hidden lg:block absolute -top-2 left-0 max-w-[15rem] -rotate-2 px-5 py-4 z-20"
                style={{ background: PANEL, border: `1px solid ${LINE}` }}
              >
                <span className="ff-display italic" style={{ fontSize: "1.15rem" }}>
                  Hi, I'm Pingo! 👋 I'll help you find the perfect PG.
                </span>
              </div>
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-full blur-2xl opacity-40"
                  style={{ background: `radial-gradient(circle, ${LIME}, transparent 70%)` }}
                />
                <img src="m1.svg" alt="StayPoint mascot Pingu" className="relative w-64 md:w-80 h-auto object-contain float" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[55%] h-3 rounded-[100%] blur-md" style={{ background: "rgba(21,23,15,0.18)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== MARQUEE ====================== */}
      <section className="py-4 overflow-hidden" style={{ background: GREEN }}>
        <div className="marquee items-center">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 ff-mono uppercase tracking-[0.2em] pr-10" style={{ color: PAPER, fontSize: "0.85rem" }}>
              <span>No brokerage</span>
              <span style={{ color: LIME }}>✺</span>
              <span>Verified stays</span>
              <span style={{ color: LIME }}>✺</span>
              <span>Live availability</span>
              <span style={{ color: LIME }}>✺</span>
            </div>
          ))}
        </div>
      </section>

      {/* ====================== STATS ====================== */}
      <section style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 grid grid-cols-2 md:grid-cols-4">
          {[
            { value: 50, suffix: "+", label: "Verified PGs" },
            { value: 100, suffix: "+", label: "Students housed" },
            { value: 0, suffix: " ₹", label: "Brokerage" },
            { value: 24, suffix: "/7", label: "Support" },
          ].map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className="px-2 md:px-8 py-6 md:py-0"
            >
              <div style={{ borderLeft: i === 0 ? "none" : `1px solid ${LINE}` }} className="md:pl-8 md:h-full md:flex md:flex-col md:justify-center -ml-2 md:ml-0 pl-4 md:pl-8" >
                <div className="ff-display" style={{ fontSize: "clamp(2.5rem,5vw,3.75rem)", lineHeight: 1, letterSpacing: "-0.03em", fontWeight: 500 }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="ff-mono uppercase tracking-[0.18em] mt-3" style={{ fontSize: "0.68rem", color: "#6B6A5C" }}>
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ====================== FEATURES ====================== */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <Reveal>
            <Eyebrow index="01">Why StayPoint</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="ff-display mt-6 max-w-3xl" style={{ fontSize: "clamp(2.2rem,5vw,4rem)", lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 500 }}>
              Everything you need. <span className="italic" style={{ color: "#9A9684", fontWeight: 400 }}>Nothing you don't.</span>
            </h2>
          </Reveal>

          {/* Editorial grid: feature 01 large, others stacked */}
          <div className="mt-16 grid lg:grid-cols-12 gap-px" style={{ background: LINE, border: `1px solid ${LINE}` }}>
            {/* Big — verified (dark block) */}
            <Reveal className="lg:col-span-7" delay={0.05}>
              <div className="h-full p-8 md:p-12 relative overflow-hidden" style={{ background: INK, color: PAPER }}>
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: GREEN }} />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <span className="ff-mono" style={{ fontSize: "0.8rem", color: LIME }}>{features[0].n}</span>
                    <ShieldCheck size={28} style={{ color: LIME }} />
                  </div>
                  <h3 className="ff-display mt-16 md:mt-24" style={{ fontSize: "clamp(1.8rem,3vw,2.75rem)", lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 500 }}>
                    {features[0].title}
                  </h3>
                  <p className="mt-4 max-w-md leading-relaxed" style={{ color: "rgba(244,241,234,0.65)", fontSize: "1.05rem" }}>
                    {features[0].desc}
                  </p>
                  <div className="mt-auto pt-10 flex flex-wrap gap-2">
                    {features[0].tags.map((t) => (
                      <span key={t} className="ff-mono uppercase tracking-[0.12em] px-3 py-1.5" style={{ fontSize: "0.65rem", border: "1px solid rgba(244,241,234,0.2)", color: "rgba(244,241,234,0.8)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Stacked right column */}
            <div className="lg:col-span-5 grid grid-rows-3 gap-px" style={{ background: LINE }}>
              {features.slice(1).map((f, i) => (
                <Reveal key={f.n} delay={0.1 + i * 0.07}>
                  <div className="group h-full p-7 md:p-9 flex items-start gap-5 transition-colors" style={{ background: PANEL }}>
                    <f.icon size={22} style={{ color: GREEN }} className="shrink-0 mt-1" />
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="ff-mono" style={{ fontSize: "0.72rem", color: "#9A9684" }}>{f.n}</span>
                        <h3 className="ff-display" style={{ fontSize: "1.5rem", letterSpacing: "-0.01em", fontWeight: 500 }}>{f.title}</h3>
                      </div>
                      <p className="mt-2 leading-relaxed" style={{ color: "#6B6A5C" }}>{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================== HOW IT WORKS ====================== */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: INK, color: PAPER }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[45%] blur-[140px] opacity-20" style={{ background: GREEN }} />
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 relative z-10">
          <Reveal>
            <Eyebrow index="02" light>How it works</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="ff-display mt-6 max-w-2xl" style={{ fontSize: "clamp(2.2rem,5vw,4rem)", lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 500 }}>
              From confused to <span className="italic" style={{ color: LIME, fontWeight: 400 }}>moved in</span>, in four steps.
            </h2>
          </Reveal>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
            {[
              { title: "Explore PGs", desc: "Search by college, city or budget.", img: "/m5.svg" },
              { title: "Check details", desc: "Verified photos, prices & live beds.", img: "/m3.svg" },
              { title: "Connect direct", desc: "Message the owner. No middlemen.", img: "/m4.svg" },
              { title: "Move in", desc: "Settle in. Zero brokerage paid.", img: "/m6.svg" },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative" style={{ borderTop: `1px solid rgba(244,241,234,0.18)` }}>
                  <div className="pt-6 flex items-center justify-between">
                    <span className="ff-mono" style={{ fontSize: "0.75rem", color: LIME }}>0{i + 1}</span>
                  </div>
                  <div className="relative mt-4 flex justify-center">
                    <div className="absolute inset-0 blur-2xl opacity-30 rounded-full" style={{ background: GREEN }} />
                    <img src={step.img} alt={step.title} className="relative w-40 h-40 object-contain hover:-translate-y-2 transition-transform duration-300" />
                  </div>
                  <h3 className="ff-display mt-5" style={{ fontSize: "1.6rem", fontWeight: 500 }}>{step.title}</h3>
                  <p className="mt-2 leading-relaxed" style={{ color: "rgba(244,241,234,0.55)" }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== TESTIMONIALS ====================== */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <Reveal>
            <Eyebrow index="03">Reviews</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="ff-display mt-6 max-w-2xl" style={{ fontSize: "clamp(2.2rem,5vw,4rem)", lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 500 }}>
              Don't just take <span className="italic" style={{ color: "#9A9684", fontWeight: 400 }}>our</span> word for it.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 relative" style={{ maskImage: "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)" }}>
          <div className="marquee-fast gap-px">
            {[...testimonials, ...testimonials].map((r, i) => (
              <figure
                key={i}
                className="w-[320px] md:w-[400px] shrink-0 mx-3 p-8 flex flex-col justify-between"
                style={{ background: PANEL, border: `1px solid ${LINE}` }}
              >
                <div>
                  <div className="flex gap-0.5 mb-5" style={{ color: GREEN }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={15} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="ff-display leading-snug" style={{ fontSize: "1.4rem", letterSpacing: "-0.01em", fontWeight: 400 }}>
                    “{r.text}”
                  </blockquote>
                </div>
                <figcaption className="mt-8 pt-5 flex items-center gap-3" style={{ borderTop: `1px solid ${LINE}` }}>
                  <span className="w-10 h-10 flex items-center justify-center ff-display" style={{ background: GREEN, color: PAPER, fontSize: "1.1rem" }}>
                    {r.name[0]}
                  </span>
                  <span>
                    <span className="block" style={{ fontWeight: 600 }}>{r.name}</span>
                    <span className="block ff-mono uppercase tracking-[0.1em]" style={{ fontSize: "0.62rem", color: "#6B6A5C" }}>{r.college}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== CTA ====================== */}
      <section className="px-6 md:px-10 pb-24">
        <Reveal>
          <div className="max-w-[1280px] mx-auto relative overflow-hidden grain" style={{ background: GREEN, color: PAPER }}>
            <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: LIME }} />
            <div className="relative z-10 px-8 md:px-20 py-20 md:py-28 grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-8">
                <Eyebrow index="◆" light>Start now · It's free</Eyebrow>
                <h2 className="ff-display mt-6" style={{ fontSize: "clamp(2.5rem,6vw,5rem)", lineHeight: 0.98, letterSpacing: "-0.03em", fontWeight: 500 }}>
                  Ready to find your{" "}
                  <span className="italic" style={{ fontWeight: 400, color: INK }}>perfect</span> space?
                </h2>
                <p className="mt-6 max-w-md leading-relaxed" style={{ color: "rgba(244,241,234,0.8)", fontSize: "1.1rem" }}>
                  Join thousands of students who've already found their ideal PG — verified, live, and broker-free.
                </p>
                <Link
                  to="/explore"
                  className="group mt-9 inline-flex items-center gap-3 px-9 py-4 ff-mono uppercase tracking-[0.15em] transition-colors"
                  style={{ fontSize: "0.76rem", background: INK, color: PAPER }}
                >
                  Start exploring now
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <img src="m1.svg" alt="StayPoint mascot" className="w-48 md:w-60 object-contain float" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ====================== FOOTER ====================== */}
      <footer style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <img src="/logo sp.svg" alt="StayPoint" className="h-8 w-auto object-contain" />
            </div>
            <p className="mt-4 max-w-xs leading-relaxed" style={{ color: "#6B6A5C" }}>
              Verified PGs with real-time availability and zero brokerage — built for students, by students.
            </p>
          </div>
          {[
            { title: "Product", links: ["Explore", "How it works", "Pricing", "For owners"] },
            { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Safety", "Support"] },
          ].map((col) => (
            <div key={col.title} className="md:col-span-2 lg:col-span-2">
              <h4 className="ff-mono uppercase tracking-[0.18em]" style={{ fontSize: "0.68rem", color: "#9A9684" }}>{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:underline transition-colors" style={{ color: "#54533F" }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${LINE}` }}>
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 ff-mono uppercase tracking-[0.12em]" style={{ fontSize: "0.66rem", color: "#9A9684" }}>
            <span>© {new Date().getFullYear()} StayPoint</span>
            <span>Made for students by students</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
