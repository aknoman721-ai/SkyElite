import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Scene } from './components/3d/Scene';
import { Navbar } from './components/sections/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { PremiumSection } from './components/sections/PremiumSection';
import { AccessibleSection } from './components/sections/AccessibleSection';
import { ComfortSection } from './components/sections/ComfortSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { FinalCtaSection } from './components/sections/FinalCtaSection';
import { BookingModal } from './components/ui/BookingModal';
import { LoadingScreen } from './components/ui/LoadingScreen';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Simulate smooth 3D asset initialization and scene readiness
  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingProgress(55), 250);
    const timer2 = setTimeout(() => setLoadingProgress(85), 500);
    const timer3 = setTimeout(() => {
      setLoadingProgress(100);
      setIsLoaded(true);
    }, 750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Initialize Lenis smooth scrolling & GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  // Set up ScrollTrigger timelines and scrub-based animation
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Overall scroll tracking driving the 3D scene
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });

      // 2. HERO: Fade and slide up headline, label, and buttons as user scrolls
      gsap.to('.hero-content', {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '60% top',
          scrub: true,
        },
      });

      gsap.to('.hero-scroll-indicator', {
        opacity: 0,
        y: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '25% top',
          scrub: true,
        },
      });

      // 3. PREMIUM SECTION CINEMATIC REVEAL & PARALLAX
      const premiumEl = document.querySelector('#premium');
      if (premiumEl) {
        // Text block subtle parallax: moves 30px slower than the scroll
        gsap.to('.premium-content-wrapper', {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: '#premium',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });

        // Choreographed entrance timeline
        const premiumTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#premium',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });

        premiumTl
          .fromTo(
            '.premium-tag',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
          )
          .fromTo(
            '.premium-heading',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
            '-=0.4'
          )
          .fromTo(
            '.premium-line',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out' },
            '-=0.5'
          )
          .fromTo(
            '.premium-divider',
            { scaleX: 0 },
            { scaleX: 1, duration: 0.9, ease: 'power2.out' },
            '-=0.4'
          )
          .fromTo(
            '.stat-item',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power2.out' },
            '-=0.5'
          );
      }

      // 4. Staggered text reveals for other sections
      const otherSections = ['#accessible', '#comfort', '#experience'];
      otherSections.forEach((selector) => {
        const el = document.querySelector(selector);
        if (!el) return;

        const targets = el.querySelectorAll('h2, p, .comfort-card, .experience-card, [class*="grid"]');
        if (targets.length) {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Smooth scroll handler for navbar links
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0, duration: 1.4 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDiscover = () => {
    handleNavigate('premium');
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gray-50 text-[#202A36] selection:bg-[#202A36] selection:text-white"
    >
      {/* Loading Screen */}
      <LoadingScreen progress={loadingProgress} isLoaded={isLoaded} />

      {/* Fixed 3D Scene Layer (behind page content) */}
      <Scene scrollProgress={scrollProgress} reducedMotion={reducedMotion} />

      {/* Top Navigation */}
      <Navbar
        onNavigate={handleNavigate}
        onOpenBooking={() => setIsBookingOpen(true)}
      />

      {/* HTML Sections scrolling over 3D Canvas */}
      <main className="relative z-10 w-full">
        {/* Section 0: Hero */}
        <HeroSection
          onDiscover={handleDiscover}
          onBookNow={() => setIsBookingOpen(true)}
        />

        {/* Section 1: Premium */}
        <PremiumSection />

        {/* Section 2: Accessible */}
        <AccessibleSection
          onSelectRoute={() => setIsBookingOpen(true)}
        />

        {/* Section 3: Comfort */}
        <ComfortSection />

        {/* Section 4: Experience */}
        <ExperienceSection />

        {/* Section 5: Final CTA & Footer */}
        <FinalCtaSection onBookNow={() => setIsBookingOpen(true)} />
      </main>

      {/* Interactive Booking & Charter Quote Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
