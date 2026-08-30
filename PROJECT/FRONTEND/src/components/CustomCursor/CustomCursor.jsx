import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    // Direct GSAP quickTo setters for instant & lag-free tracking
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.04, ease: 'none' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.04, ease: 'none' });
    
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.18, ease: 'power2.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.18, ease: 'power2.out' });

    const handleMouseMove = (e) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);

      // Detect hover over any clickable element
      const target = e.target;
      if (target) {
        const isInteractive = target.closest(
          'a, button, input, select, textarea, label, [role="button"], .social-btn, .mobile-toggle, .ghost-btn, .nav-link, .logout-btn, .hamburger-btn, .eye-btn, .social-link-btn, .cta-btn-white'
        );
        setIsHovered(!!isInteractive);
      }
    };

    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="custom-cursor-container">
      <div 
        ref={dotRef} 
        className={`custom-cursor-dot ${isHovered ? 'cursor-hover' : ''} ${isActive ? 'cursor-active' : ''}`}
      />
      <div 
        ref={ringRef} 
        className={`custom-cursor-ring ${isHovered ? 'cursor-hover' : ''} ${isActive ? 'cursor-active' : ''}`}
      />
    </div>
  );
};

export default CustomCursor;
