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
  ShieldCheck 
} from 'lucide-react';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-hero h1', { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out' });
      gsap.from('.about-hero-subtitle', { opacity: 0, y: 16, duration: 0.7, delay: 0.15, ease: 'power2.out' });
      
      gsap.from('.founder-card', {
        scrollTrigger: {
          trigger: '.founder-card',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.75,
        ease: 'power2.out'
      });

      gsap.from('.tech-stack-card', {
        scrollTrigger: {
          trigger: '.tech-stack-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 25,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-page-container" ref={containerRef}>
      <div className="about-content-wrapper">
        
        {/* ================= HERO SECTION ================= */}
        <section className="about-hero">
          <h1>
            Empowering Innovation with <span className="gradient-text-about">Modern Full-Stack</span> Solutions
          </h1>
          <p className="about-hero-subtitle">
            A production-ready, modular architecture engineered for rapid development, rock-solid security, and fluid digital experiences.
          </p>
        </section>

        {/* ================= FOUNDER & LEAD DEVELOPER SPOTLIGHT ================= */}
        <section className="founder-card">
          <div className="founder-avatar-col">
            <div className="founder-img-wrapper">
              <img 
                src={profileImg} 
                alt="Azka Azeem - Founder & Full-Stack Developer" 
                className="founder-img" 
              />
            </div>
          </div>

          <div className="founder-info-col">
            <div className="founder-header">
              <h2 className="founder-name">Azka Azeem</h2>
              <div className="founder-role-tags">
                <span className="role-tag highlight">Founder & Lead Architect</span>
                <span className="role-tag">Full-Stack MERN Developer</span>
                <span className="role-tag">UI/UX Specialist</span>
              </div>
            </div>

            <p className="founder-bio">
              Passionate Software Engineer & MERN Stack Specialist dedicated to crafting high-performance web applications, intuitive user interfaces, and scalable backend ecosystems. With a strong focus on clean architecture, seamless state management, and real-time security.
            </p>

            {/* Social & Contact Links */}
            <div className="founder-socials">
              {/* Portfolio */}
              <a 
                href="https://portfolio-03-tan.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link-btn portfolio-btn"
                title="View Portfolio"
              >
                <Globe size={16} />
                <span>Live Portfolio</span>
                <ExternalLink size={13} />
              </a>

              {/* LinkedIn */}
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
                  style={{ width: '16px', height: '16px' }} 
                />
                <span>LinkedIn</span>
              </a>

              {/* GitHub */}
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
                  style={{ width: '16px', height: '16px' }} 
                />
                <span>GitHub</span>
              </a>

              {/* Reddit */}
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
                  style={{ width: '16px', height: '16px' }} 
                />
                <span>Reddit</span>
              </a>

              {/* Email */}
              <a 
                href="mailto:azkaazeem804@gmail.com" 
                className="social-link-btn"
                title="Send Email"
              >
                <Mail size={16} color="#ea4335" />
                <span>Email Me</span>
              </a>
            </div>
          </div>
        </section>

        {/* ================= ARCHITECTURE & VALUES GRID ================= */}
        <section className="about-grid-2">
          {/* Mission Card */}
          <div className="info-card">
            <div className="info-card-icon">
              <Code2 size={24} />
            </div>
            <h3>Engineered for Speed & Scale</h3>
            <p>
              Designed as a plug-and-play modular boilerplate to deliver complex full-stack features within minutes during hackathons and production sprints.
            </p>
            <div className="tech-pills">
              <span className="tech-pill">React 19</span>
              <span className="tech-pill">Vite</span>
              <span className="tech-pill">GSAP</span>
              <span className="tech-pill">Tailwind CSS</span>
            </div>
          </div>

          {/* Security & Database Card */}
          <div className="info-card">
            <div className="info-card-icon">
              <ShieldCheck size={24} />
            </div>
            <h3>Enterprise Security & Cloud</h3>
            <p>
              Stateless JWT authentication, Role-Based Access Control (RBAC), Google & GitHub OAuth integrations, and direct-to-cloud media streaming via Cloudinary.
            </p>
            <div className="tech-pills">
              <span className="tech-pill">Node.js</span>
              <span className="tech-pill">Express</span>
              <span className="tech-pill">MongoDB Atlas</span>
              <span className="tech-pill">Cloudinary</span>
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION ================= */}
        <section className="about-cta-banner">
          <h2>Let's Build Something Exceptional Together</h2>
          <p>
            Have a project in mind or looking for a full-stack engineer? Feel free to reach out or explore the portfolio.
          </p>
          <a 
            href="https://portfolio-03-tan.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="cta-btn-white"
          >
            <Globe size={16} />
            <span>Explore Azka's Portfolio</span>
            <ExternalLink size={14} />
          </a>
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default About;
