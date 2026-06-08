import { Link } from "react-router-dom"
import { Wifi, CheckCircle, MapIcon, Zap } from "lucide-react"

export default function Landing() {
  const features = [
    { image:"/verified.svg", title: "Verified PGs", description: "Only verified and authentic PG listings" },
    { image:"/smartpick.svg", title: "Smart Picks", description: "AI-powered recommendations for you" },
    { image:"/livestatus.svg", title: "Live Status", description: "Real-time availability updates" },
    { image:"/easyaccess.svg", title: "Easy Access", description: "One-click contact with PG owners" },
  ]

  const testimonials = [
    { name: "Rahul Kumar", role: "Student", text: "Found my perfect PG within minutes! Best platform ever." },
    { name: "Priya Singh", role: "Student", text: "The verification system gave me peace of mind about safety." },
    { name: "Amit Patel", role: "PG Owner", text: "Listed my PG and got genuine inquiries. Highly recommended!" },
    { name: "Neha Sharma", role: "Student", text: "Great interface and real-time availability updates." },
    { name: "Rohan Gupta", role: "Student", text: "Saved me so much time searching for accommodation." },
    { name: "Anjali Desai", role: "PG Owner", text: "Easy listing process, excellent support team." },
  ]

  const featureColors = ["bg-[#CAE594]", "bg-[#DBECFE]", "bg-[#FFE9CA]", "bg-[#F9DDF6]"]
  const testimonialColors = [
    "bg-[#F9DDF6]",
    "bg-[#DBECFE]",
    "bg-[#FFE9CA]",
    "bg-[#FFE9CA]",
    "bg-[#CAE594]",
    "bg-[#F9DDF6]",
  ]

  return (
    <div className="bg-background">
      {/* Hero Section */}
<section className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-[#FFFEF9] overflow-hidden">
  {/* Left map vector */}
  <img
    src="/leftmapvector.svg"
    alt="left path"
    className="absolute left-[-1rem] top-[10%] w-40 md:w-64 lg:w-72 xl:w-80 opacity-90 pointer-events-none select-none"
  />

  {/* Right map vector */}
  <img
    src="/rightmapvector.svg"
    alt="right path"
    className="absolute right-[-2rem] bottom-[2%] w-40 md:w-64 lg:w-72 xl:w-80 opacity-90 pointer-events-none select-none z-[1]"
  />

  <div className="max-w-4xl mx-auto text-center relative z-10">
    <div className="flex justify-center">
      <img src="/hero-image.svg" alt="Hero" className="w-[420px] md:w-[500px] lg:w-[650px]" />
    </div>
    <h1 className="text-2xl md:text-4xl font-bold text-black mb-4 text-balance">
      <span className="bg-[#87E64B] px-1">Confused</span> about where to find the best PG?
    </h1>
    <p className="text-lg md:text-xl text-black mb-8 text-balance">
      StayPoint brings verified PGs with real-time availability and smart recommendations — all in one place.
    </p>
    <Link
      to="/explore"
      className="inline-block px-8 py-3 bg-black text-[#87E64B] rounded-lg hover:bg-[#87E64B] hover:text-black transition font-semibold no-underline"
    >
      Find Now
    </Link>
  </div>
</section>


      {/* How We Help */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">How We Help <span className="bg-[#87E64B] px-1">Students</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className={`${featureColors[idx]} p-6 rounded-xl shadow-lg hover:shadow-xl transition`}>
              <img 
          src={feature.image} 
          alt={feature.title}
          className="w-36 h-28 object-contain mb-4 mx-auto"
        />
              <h3 className="text-xl text-center font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-center text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
        <section className="py-20 px-4 bg-[#FFFEF9] flex items-center justify-center">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">Key <span className="bg-[#87E64B] px-1">Features</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-1 items-center">
          <div className="flex justify-center w-full">
            <img
              src="/mobile.svg"
              alt="Phone mockup"
              className="w-300"
            />
          </div>
            </div>
          </div>
        </section>

        {/* User Feedback */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-[#FFFEF9]">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">Users <span className="bg-[#87E64B] px-1 ">Feedback</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className={`${testimonialColors[idx]} p-6 rounded-xl shadow-lg`}>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
