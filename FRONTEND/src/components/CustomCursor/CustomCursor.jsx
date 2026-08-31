import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on desktop devices with hover support
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Instant GSAP setters for zero latency
    const xDot = gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'power3' });
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'power3' });

    // Smooth fluid follower for the outer ring
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.22, ease: 'power2.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.22, ease: 'power2.out' });

    const handleMouseMove = (e) => {
      setIsVisible(true);
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      const target = e.target;
      if (target) {
        const isClickable = target.closest(
          'a, button, input, select, textarea, label, [role="button"], .interactive, .chip-btn, .mobile-nav-item, .sidebar-nav-item, .footer-social-pill, .footer-back-top-btn'
        );
        setIsHovered(!!isClickable);
      }
    };

    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div className={`custom-cursor-container ${isVisible ? 'visible' : ''}`}>
      <div 
        ref={dotRef} 
        className={`custom-cursor-dot ${isHovered ? 'hover' : ''} ${isActive ? 'active' : ''}`} 
      />
      <div 
        ref={ringRef} 
        className={`custom-cursor-ring ${isHovered ? 'hover' : ''} ${isActive ? 'active' : ''}`} 
      />
    </div>
  );
};

export default CustomCursor;
