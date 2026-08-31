import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGsapScrollTrigger = (containerRef, deps = []) => {
  useEffect(() => {
    if (!containerRef?.current) return;

    const ctx = gsap.context(() => {
      // 1. Hero Reveal (Instant fade up)
      gsap.from('.gsap-hero', {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1
      });

      // 2. Scroll Trigger Cards & Sections
      const revealItems = containerRef.current.querySelectorAll('.gsap-reveal, .civic-card, .right-card, .stat-item-box, .founder-card, .kpi-card-minimal, .tracked-result-card');
      revealItems.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, deps);
};

export default useGsapScrollTrigger;
