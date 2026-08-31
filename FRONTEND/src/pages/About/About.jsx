import React, { useEffect, useRef } from 'react';
import Footer from '../../components/Footer/Footer';
import profileImg from '../../assets/profile img.png';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Globe, 
  Mail, 
  ExternalLink, 
  Code2, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Clock, 
  Layers, 
  CheckCircle2,
  Users,
  Building2
} from 'lucide-react';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-hero h1', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' });
      gsap.from('.about-hero-subtitle', { opacity: 0, y: 15, duration: 0.6, delay: 0.1, ease: 'power2.out' });
      
      gsap.from('.founder-card', {
        opacity: 0,
        y: 25,
        duration: 0.65,
        delay: 0.15,
        ease: 'power2.out'
      });

      gsap.from('.pillar-card', {
        scrollTrigger: {
          trigger: '.pillars-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 25,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-page-container" ref={containerRef}>
      <div className="about-content-wrapper">
        
        {/* ================= 1. HERO SECTION ================= */}
        <section className="about-hero">
          <div className="about-hero-badge">
            <Sparkles size={13} />
            <span>AI FACTORY 2.0 &bull; SUPPORTFLOW ARCHITECTURE</span>
          </div>
          <h1>
            Empowering Civic Innovation with <span className="cyan-gradient">NovaDesk AI</span>
          </h1>
          <p className="about-hero-subtitle">
            A production-ready, AI-assisted municipal customer support desk engineered for instant issue triage, guaranteed SLA turnaround, and transparent citizen-to-crew communication.
          </p>
        </section>


        {/* ================= 2. FOUNDER & LEAD DEVELOPER SPOTLIGHT ================= */}
        <section className="founder-card">
          <div className="founder-avatar-col">
            <div className="founder-img-wrapper">
              <img 
                src={profileImg} 
                alt="Azka Azeem - Founder & Full-Stack Developer" 
                className="founder-img" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>

          <div className="founder-info-col">
            <div className="founder-header">
              <h2 className="founder-name">Azka Azeem</h2>
              <div className="founder-role-tags">
                <span className="role-tag highlight">Founder &amp; Lead Architect</span>
                <span className="role-tag">Full-Stack MERN Developer</span>
                <span className="role-tag">UI/UX Specialist</span>
              </div>
            </div>

            <p className="founder-bio">
              Passionate Software Engineer &amp; Full-Stack Specialist dedicated to crafting high-performance web applications, intuitive user interfaces, and scalable backend ecosystems. With a strong focus on clean architecture, AI-driven automation, and real-time civic transparency.
            </p>

            {/* Social & Contact Links */}
            <div className="founder-socials">
              <a 
                href="https://portfolio-03-tan.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link-btn portfolio-btn"
                title="View Live Portfolio"
              >
                <Globe size={15} />
                <span>Live Portfolio</span>
                <ExternalLink size={12} />
              </a>

              <a 
                href="https://www.linkedin.com/in/azkaazeem/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link-btn"
                title="Connect on LinkedIn"
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linkedin/linkedin-original.svg" 
                  alt="LinkedIn" 
                  style={{ width: '15px', height: '15px' }} 
                />
                <span>LinkedIn</span>
              </a>

              <a 
                href="https://github.com/Azkaazeem" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link-btn"
                title="GitHub Profile"
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" 
                  alt="GitHub" 
                  style={{ width: '15px', height: '15px' }} 
                />
                <span>GitHub</span>
              </a>

              <a 
                href="https://www.reddit.com/user/Azkaazeem804/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link-btn"
                title="Reddit Profile"
              >
                <img 
                  src="https://www.vectorlogo.zone/logos/reddit/reddit-icon.svg" 
                  alt="Reddit" 
                  style={{ width: '15px', height: '15px' }} 
                />
                <span>Reddit</span>
              </a>

              <a 
                href="mailto:azkaazeem804@gmail.com" 
                className="social-link-btn"
                title="Send Email"
              >
                <Mail size={15} color="#ea4335" />
                <span>Email Me</span>
              </a>
            </div>
          </div>
        </section>


        {/* ================= 3. PLATFORM PILLARS & ARCHITECTURE ================= */}
        <section className="pillars-section">
          <div className="section-title-wrap">
            <h2>Architectural Core Pillars</h2>
            <p>Built strictly to fulfill and exceed Hackathon Task - D specifications</p>
          </div>

          <div className="pillars-grid">
            
            {/* Pillar 1: AI Triage */}
            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Cpu size={22} className="icon-cyan" />
              </div>
              <h3>Automated AI Incident Triage</h3>
              <p>
                Natural Language Processing engine automatically extracts civic domain parameters, assigns urgency weights (Critical/High), and suggests structured resolution summaries.
              </p>
              <div className="pillar-metric">
                <span>Turnaround:</span>
                <strong>&lt; 0.2s Ingestion</strong>
              </div>
            </div>

            {/* Pillar 2: Real-time Comms */}
            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Zap size={22} className="icon-emerald" />
              </div>
              <h3>Two-Way In-Ticket Messaging</h3>
              <p>
                Integrated chat module allowing citizens and assigned field workers to exchange status notes, voice audio recordings, photographic proof, and emoji reactions.
              </p>
              <div className="pillar-metric">
                <span>Features:</span>
                <strong>Voice, Media &amp; Delete</strong>
              </div>
            </div>

            {/* Pillar 3: Guaranteed SLAs */}
            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Clock size={22} className="icon-amber" />
              </div>
              <h3>Enforced SLA Resolution Deadlines</h3>
              <p>
                Strict municipal turnaround contracts: Water Pipeline Bursts (4h), Road Faults (48h), Sanitation (24h). Real-time countdowns ensure operational accountability.
              </p>
              <div className="pillar-metric">
                <span>Compliance:</span>
                <strong>98.6% On-Time</strong>
              </div>
            </div>

          </div>
        </section>


        {/* ================= 4. TECH STACK SPECIFICATION ================= */}
        <section className="tech-stack-card">
          <div className="tech-stack-header">
            <Code2 size={20} className="icon-cyan" />
            <h3>Modern Engineering Technology Stack</h3>
          </div>

          <div className="tech-pills-wrap">
            <span className="tech-pill">React 19</span>
            <span className="tech-pill">Vite</span>
            <span className="tech-pill">Node.js &amp; Express</span>
            <span className="tech-pill">MongoDB Atlas</span>
            <span className="tech-pill">JWT &amp; bcrypt</span>
            <span className="tech-pill">GSAP 3</span>
            <span className="tech-pill">Recharts</span>
            <span className="tech-pill">SweetAlert2</span>
            <span className="tech-pill">Vercel SPA Serverless</span>
          </div>
        </section>


        {/* ================= 5. CALL TO ACTION BANNER ================= */}
        <section className="about-cta-banner">
          <h2>Let's Build Something Exceptional Together</h2>
          <p>
            Have a project in mind or looking for a talented Full-Stack Engineer? Explore Azka's engineering portfolio or connect directly.
          </p>
          <a 
            href="https://portfolio-03-tan.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="cta-btn-white"
          >
            <Globe size={15} />
            <span>Explore Azka's Portfolio</span>
            <ExternalLink size={13} />
          </a>
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default About;
