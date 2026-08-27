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
    // Only run on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    // GSAP quickTo for ultra-smooth trailing performance
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.25, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.25, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);

      // Check if hovering over clickable / interactive elements
      const target = e.target;
      const isInteractive = target.closest(
        'a, button, input, select, textarea, label, [role="button"], .social-btn, .mobile-toggle, .ghost-btn, .nav-link, .logout-btn, .hamburger-btn, .eye-btn'
      );
      setIsHovered(!!isInteractive);
    };

    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
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
  }, [isVisible]);

  return (
    <>
      <div 
        ref={dotRef} 
        className={`custom-cursor-dot ${isHovered ? 'cursor-hover' : ''} ${isActive ? 'cursor-active' : ''}`}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div 
        ref={ringRef} 
        className={`custom-cursor-ring ${isHovered ? 'cursor-hover' : ''} ${isActive ? 'cursor-active' : ''}`}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  );
};

export default CustomCursor;
