import React from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Home, 
  Building2, 
  Key, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  Eye, 
  Users, 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  Sparkles, 
  Phone, 
  ArrowRight,
  ClipboardCheck,
  BadgePercent,
  Check,
  CornerDownRight
} from 'lucide-react';

interface AboutPageViewProps {
  setActiveTab: (tab: any) => void;
  onOpenCustomRequest: () => void;
}

export default function AboutPageView({ setActiveTab, onOpenCustomRequest }: AboutPageViewProps) {
  // Common container for consistent animation stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="bg-white text-[#0F172A] min-h-screen overflow-x-hidden font-sans" id="about-us-page-view">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#070d19] overflow-hidden py-24" id="about-hero">
        {/* Cinematic rich background with abstract luxury architecture silhouette */}
        <div className="absolute inset-0 z-0">
          <img 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop" 
            alt="Modern luxury architecture" 
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d19] via-[#070d19]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d19]/90 via-transparent to-[#070d19]/90" />
        </div>

        {/* Delicate floating gold and white circular light elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] mb-6"
          >
            <Sparkles className="h-3 w-3" />
            <span>About Dvarix Realty</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-tight md:leading-normal font-medium max-w-4xl mx-auto"
          >
            You Need a Property.<br />
            <span className="text-[#D4AF37] relative inline-block">
              We Find the Right One.
              <span className="absolute left-0 bottom-1 sm:bottom-2 w-full h-[3px] bg-[#10B981] rounded-full opacity-60" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-8 text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto font-light"
          >
            At Dvarix Realty, we understand that every property requirement is unique. Whether you are searching for your dream home, looking for a profitable investment opportunity, planning to rent a suitable space, or exploring commercial real estate options, our goal is simple — to help you find the right property solution with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <button
              onClick={() => {
                setActiveTab('Properties');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-xl text-sm font-semibold tracking-wide transition duration-200 cursor-pointer shadow-lg shadow-emerald-900/20 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Explore Properties
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setActiveTab('Contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl text-sm font-semibold tracking-wide transition duration-200 cursor-pointer border border-slate-700 hover:border-slate-500 backdrop-blur-sm flex items-center justify-center"
            >
              Contact Us
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT DVARIX REALTY */}
      <section className="py-24 bg-white" id="who-we-are">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center text-left">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10B981] block">ABOUT THE FIRM</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">Who We Are</h2>
              
              <div className="space-y-4 text-[#475569] font-light leading-relaxed text-sm sm:text-base">
                <p>
                  Dvarix Realty was founded with a vision to simplify the property journey for individuals, families, and businesses. We believe that buying, selling, renting, or investing in real estate should not be overwhelming. With the right guidance and support, every client can make informed and confident decisions.
                </p>
                
                <div className="border-l-4 border-[#D4AF37] pl-5 py-2 my-6 bg-slate-50/80 rounded-r-xl">
                  <span className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Our Core Commitment</span>
                  <p className="font-serif text-lg sm:text-xl text-[#0F172A] font-medium italic">
                    "Your requirement comes first."
                  </p>
                </div>

                <p>
                  By understanding what matters most to you, we strive to provide personalized property solutions that suit your lifestyle, budget, and future aspirations.
                </p>
              </div>
            </div>

            {/* Right Illustration/Imagery Column */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[#10B981] pointer-events-none" />
              <div className="bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" 
                  alt="High-end architectural space" 
                  className="w-full h-[350px] object-cover scale-[1.01] hover:scale-105 transition duration-500"
                />
              </div>

              {/* Float Badge overlay */}
              <div className="absolute -right-6 bottom-8 bg-white border border-slate-100 p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-[200px]">
                <div className="h-10 w-10 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 leading-tight">100% Client-Centric Focused</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO (COMPREHENSIVE SOLUTIONS) */}
      <section className="py-24 bg-slate-50 border-y border-slate-100" id="comprehensive-solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">DVARIX REALTY</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">
              Comprehensive Real Estate Solutions
            </h2>
            <p className="text-[#475569] text-xs sm:text-sm font-light max-w-xl mx-auto">
              Our capability ecosystem addresses diverse property needs, structured meticulously to deliver premium solutions.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
          >
            
            {/* Card 1: Residential Properties */}
            <motion.div 
              variants={itemVariants} 
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#D4AF37] flex items-center justify-center">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3">Residential Properties</h3>
                  <ul className="space-y-2.5 text-xs text-slate-500 font-light">
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Residential plots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Independent houses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Villas and duplex homes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Apartments and gated communities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Luxury residential properties</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-50">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1">
                  Active Listings <CornerDownRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>

            {/* Card 2: Commercial Properties */}
            <motion.div 
              variants={itemVariants} 
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#10B981] flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3">Commercial Properties</h3>
                  <ul className="space-y-2.5 text-xs text-slate-500 font-light">
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Office spaces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Retail shops</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Commercial buildings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Warehouses and industrial properties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>Investment-oriented assets</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-50">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1">
                  Corporate Grade A <CornerDownRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>

            {/* Card 3: Property Rentals */}
            <motion.div 
              variants={itemVariants} 
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#D4AF37] flex items-center justify-center">
                  <Key className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3">Property Rentals</h3>
                  <p className="text-xs text-[#5c6e83] leading-relaxed font-light font-sans">
                    Whether you are searching for a rental home or a business space, we help simplify the rental process by connecting clients with suitable options matching their spatial, geographical, and budget mandates.
                  </p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-50">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1">
                  Simplified Terms <CornerDownRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>

            {/* Card 4: Investment Opportunities */}
            <motion.div 
              variants={itemVariants} 
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#10B981] flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3">Investment Plans</h3>
                  <p className="text-xs text-[#5c6e83] leading-relaxed font-light font-sans">
                    We support investors by helping them explore opportunities that align with their financial objectives and investment strategies, providing extensive research matrices, historical CAGR data, and growth trajectory projections.
                  </p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-50">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1">
                  High-yield Focus <CornerDownRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 4. OUR PHILOSOPHY */}
      <section className="py-24 bg-[#0F172A] relative overflow-hidden" id="about-philosophy">
        {/* Subtle texture grids and circles */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block mr-1"></span>
            Our Philosophy
          </div>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white tracking-tight italic font-medium leading-relaxed max-w-3xl mx-auto mb-8">
            "You Need a Property.<br className="sm:hidden" /> We Find the Right One."
          </h3>

          <div className="space-y-6 text-slate-300 font-light leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
            <p>
              This philosophy reflects our commitment to delivering solutions based on individual requirements rather than promoting a one-size-fits-all approach.
            </p>
            <p>
              Every client's journey is different, and every decision deserves thoughtful guidance. By listening first and advising second, we ensure that our recommendations genuinely serve your best interests.
            </p>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE DVARIX REALTY */}
      <section className="py-24 bg-white" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10B981] block">ECOSYSTEM ADVANTAGES</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">Why Choose Dvarix Realty</h2>
            <p className="text-[#475569] text-xs sm:text-sm font-light max-w-xl mx-auto">
              We offer several clear principles of trust, engineering reliability directly into our client support methodology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-slate-900 duration-300 hover:text-white transition-all">
              <div className="space-y-6">
                <div className="h-10 w-10 bg-[#FF5A3C]/10 text-[#FF5A3C] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#FF5A3C]">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900">Requirement-Driven Approach</h4>
                  <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-350">
                    We prioritize understanding your needs before recommending any property solutions. No pushy sales, no predefined biases.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-slate-900 duration-300 hover:text-white transition-all">
              <div className="space-y-6">
                <div className="h-10 w-10 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#10B981]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900">Trust & Transparency</h4>
                  <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-350">
                    Honest communication and ethical practices form the foundation of every interaction. No hidden clauses or unexpected fees.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-slate-900 duration-300 hover:text-white transition-all">
              <div className="space-y-6">
                <div className="h-10 w-10 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#D4AF37]">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900">Personalized Guidance</h4>
                  <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-350">
                    We recognize that each client has different goals, budgets, and expectations, framing a highly custom path for you.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-slate-900 duration-300 hover:text-white transition-all">
              <div className="space-y-6">
                <div className="h-10 w-10 bg-[#0F172A]/10 text-[#0F172A] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-white">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900">End-to-End Assistance</h4>
                  <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-350">
                    We aim to make the entire property experience smoother and more convenient, navigating legal, structural and physical setups.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-slate-900 duration-300 hover:text-white transition-all">
              <div className="space-y-6">
                <div className="h-10 w-10 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#10B981]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900">Long-Term Relationships</h4>
                  <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-350">
                    Our objective is to build lasting relationships founded on reliability and mutual trust, scaling far beyond singular deals.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 6 Placeholder/CTA */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-[#0F172A] flex flex-col justify-between text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-6 z-10">
                <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">START TODAY</p>
                <h4 className="font-serif text-xl font-medium text-white leading-snug">Let us discover your next destination.</h4>
                <p className="text-[11px] text-slate-300 font-light">
                  Submit custom parameters directly to our expert advisory desk.
                </p>
              </div>
              <button 
                onClick={onOpenCustomRequest}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] group-hover:text-[#14d393] transition cursor-pointer font-mono uppercase tracking-widest"
              >
                Send custom brief <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ADDITIONAL SUPPORT SERVICES */}
      <section className="py-24 bg-slate-50 border-t border-slate-100" id="support-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Context Left (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">EXTRA COVERAGE</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">
                Property Support Beyond Transactions
              </h2>
              <p className="text-[#475569] text-xs sm:text-sm font-light leading-relaxed">
                In addition to our core real estate offerings, Dvarix Realty can provide access to a range of property-related support services based on client requirements.
              </p>
              
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-850 font-mono text-[10px] sm:text-xs font-bold leading-relaxed flex items-start gap-2.5">
                <span className="h-4 w-4 bg-[#FF5A3C] text-white flex items-center justify-center rounded-full text-[9px] font-black shrink-0">i</span>
                <span>Services are offered based on individual client requirements.</span>
              </div>
            </div>

            {/* Checklist Right (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-left">
                
                {[
                  "Property guidance and consultation",
                  "Legal verification assistance",
                  "Home loan support",
                  "Construction-related services",
                  "Interior design solutions",
                  "Property management support",
                  "Architectural consultation",
                  "Vastu guidance",
                  "Smart home solutions",
                  "Real estate investment assistance"
                ].map((service, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
                    <div className="h-5 w-5 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-750 font-sans tracking-wide leading-tight">
                      {service}
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. MISSION & VISION */}
      <section className="py-24 bg-white" id="mission-vision">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Card: Mission */}
            <div className="bg-[#0F172A] text-white p-10 sm:p-12 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-slate-900/10 duration-300 transition-all text-left flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-6">
                <div className="h-12 w-12 bg-white/10 text-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-serif font-medium tracking-tight">Our Mission</h3>
                <p className="text-slate-300 font-light leading-relaxed text-xs sm:text-sm">
                  To empower individuals and businesses with the right real estate solutions by understanding their unique requirements and delivering transparent, value-driven guidance throughout their property journey.
                </p>
              </div>
            </div>

            {/* Card: Vision */}
            <div className="bg-[#10B981] text-white p-10 sm:p-12 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-900/10 duration-300 transition-all text-left flex flex-col justify-between">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-6">
                <div className="h-12 w-12 bg-white/10 text-white rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-serif font-medium tracking-tight text-white">Our Vision</h3>
                <p className="text-emerald-50 font-light leading-relaxed text-xs sm:text-sm">
                  To become a trusted real estate ecosystem recognized for its customer-centric approach, integrity, innovation, and commitment to helping people make confident property decisions.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. CORE VALUES */}
      <section className="py-24 bg-slate-50 border-t border-slate-100" id="core-values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10B981] block">OUR FOUNDATION</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">The Values That Define Us</h2>
            <p className="text-[#475569] text-xs sm:text-sm font-light max-w-xl mx-auto">
              Our cultural DNA dictates every client meeting, documentation process, and strategic alliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            
            {/* Value 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-9 w-9 bg-[#10B981]/15 text-[#10B981] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs">01</div>
                <h4 className="font-serif text-lg font-medium text-slate-900">Customer First</h4>
              </div>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Your goals guide our action plans. Every recommendation is tailored directly to your distinct specifications.
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-9 w-9 bg-[#D4AF37]/15 text-[#D4AF37] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs">02</div>
                <h4 className="font-serif text-lg font-medium text-slate-900">Integrity</h4>
              </div>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                We operate with pristine compliance and upfront, zero-surprise communication at every single checkpoint of the lifecycle.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-9 w-9 bg-[#FF5A3C]/15 text-[#FF5A3C] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs">03</div>
                <h4 className="font-serif text-lg font-medium text-slate-900">Excellence</h4>
              </div>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Our selection, vetting, and reporting models represent elite tier operations designed to satisfy strict investor thresholds.
              </p>
            </div>

            {/* Value 4 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-9 w-9 bg-[#0F172A]/10 text-[#0F172A] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs">04</div>
                <h4 className="font-serif text-lg font-medium text-slate-900">Transparency</h4>
              </div>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Full-view ledgers, deep digital logs, and comprehensive visual materials ensure absolute operational parameters clarity.
              </p>
            </div>

            {/* Value 5 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-9 w-9 bg-[#10B981]/15 text-[#10B981] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs">05</div>
                <h4 className="font-serif text-lg font-medium text-slate-900">Commitment</h4>
              </div>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                We are persistent. We maintain continuous search efforts and partner support until your ultimate targets are verified.
              </p>
            </div>

            {/* Value 6 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-9 w-9 bg-[#D4AF37]/15 text-[#D4AF37] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs">06</div>
                <h4 className="font-serif text-lg font-medium text-slate-900">Trust</h4>
              </div>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                The bedrock of Dvarix. Honored by families, partners, and corporate entities nationwide through robust reliability.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FINAL CALL-TO-ACTION SECTION */}
      <section className="relative py-24 bg-[#070d19] overflow-hidden" id="about-final-cta">
        
        {/* Parallax structure background overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop" 
            alt="Estate skyline" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity scale-102"
          />
          <div className="absolute inset-0 bg-[#070d19]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d19] via-transparent to-[#070d19]" />
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10B981]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">CREATE YOUR JOURNEY</span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight max-w-3xl mx-auto font-medium">
              Let's Build Your Property Journey Together
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
              Whether you are buying your first home, upgrading to a larger space, searching for rental opportunities, expanding your business through commercial real estate, or exploring investment possibilities, Dvarix Realty is here to guide you every step of the way.
            </p>

            <div className="border-t border-b border-slate-800 py-6 max-w-xl mx-auto">
              <p className="font-serif text-lg sm:text-xl text-[#10B981] font-semibold italic">
                We don't just help you find properties.<br />
                We help you find the right property solution.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
              <button
                onClick={onOpenCustomRequest}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-xl text-sm font-semibold tracking-wide transition duration-200 cursor-pointer shadow-lg shadow-emerald-900/20 hover:scale-[1.02] flex items-center justify-center gap-2 font-sans"
              >
                Get Started Today
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('Contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/60 hover:bg-slate-700/60 text-white rounded-xl text-sm font-semibold tracking-wide transition duration-200 cursor-pointer border border-slate-700 hover:border-slate-500 backdrop-blur-sm flex items-center justify-center font-sans"
              >
                Contact Dvarix Realty
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
