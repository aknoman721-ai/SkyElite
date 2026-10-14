import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent, StatItem } from '../../config/siteContent';

gsap.registerPlugin(ScrollTrigger);

// Color and styling constants matching the luxury palette
export const PREMIUM_COLORS = {
  panelBgClass: 'bg-[#202A36]/70',
  panelBorderClass: 'border-white/15',
  heading: '#FFFFFF',
  accent: '#D9BF8C',
  body: '#E6E9EE',
  statLabel: '#AEB6C2',
  divider: 'rgba(255, 255, 255, 0.20)',
};

function AnimatedStat({ stat }: { stat: StatItem }) {
  const [displayValue, setDisplayValue] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!counterRef.current) return;

    const proxy = { val: 0 };
    const tween = gsap.to(proxy, {
      val: stat.number,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counterRef.current,
        start: 'top 75%',
        once: true,
      },
      onUpdate: () => {
        setDisplayValue(Math.round(proxy.val));
      },
    });

    return () => {
      tween.kill();
    };
  }, [stat.number]);

  return (
    <div ref={counterRef} className="stat-item space-y-1">
      <div className="font-display text-4xl md:text-5xl font-normal text-white tabular-nums tracking-tight leading-none">
        {displayValue}
        <span className="text-[#D9BF8C] font-display ml-0.5">{stat.suffix}</span>
      </div>
      <div className="font-sans text-xs font-semibold tracking-wider text-[#AEB6C2] uppercase mt-1">
        {stat.label}
      </div>
      <div className="font-sans text-[11px] text-[#AEB6C2]/70 leading-tight">
        {stat.sublabel}
      </div>
    </div>
  );
}

export function PremiumSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      id="premium"
      className="premium-section relative min-h-screen w-full flex flex-col justify-start md:justify-center md:items-end px-6 sm:px-12 md:px-16 lg:px-24 py-16 md:py-20 pointer-events-none"
    >
      {/* Frosted Right-Aligned Dark Glass Panel */}
      <div
        ref={contentWrapperRef}
        className="premium-content-wrapper w-full max-w-xl md:ml-auto pointer-events-auto z-10 space-y-6 bg-[#202A36]/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/15 p-8 md:p-10 mt-12 md:mt-0"
      >
        {/* Section tag label */}
        <div className="overflow-hidden">
          <span className="premium-tag font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#D9BF8C] block">
            {siteContent.premium.tag}
          </span>
        </div>

        {/* Heading: "Premium." */}
        <div className="overflow-hidden py-1">
          <h2 className="premium-heading font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.95] text-white select-none">
            Premium<span className="text-[#D9BF8C]">.</span>
          </h2>
        </div>

        {/* 2 Short lines on craftsmanship and materials */}
        <div className="space-y-3 font-sans text-base md:text-lg leading-relaxed font-normal text-[#E6E9EE]">
          <p className="premium-line">{siteContent.premium.line1}</p>
          <p className="premium-line text-[#E6E9EE]/85">{siteContent.premium.line2}</p>
        </div>

        {/* Thin animated divider (scaleX 0 to 1) */}
        <div className="pt-2">
          <div className="premium-divider h-[1px] w-full origin-left bg-white/20" />
        </div>

        {/* Animated stat counters */}
        <div className="premium-stats grid grid-cols-3 gap-4 sm:gap-6 pt-2">
          {siteContent.premium.stats.map((stat, idx) => (
            <AnimatedStat key={`stat-${idx}`} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
