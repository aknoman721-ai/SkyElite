import React, { useState } from 'react';
import { ArrowRight, Clock, MapPin, Zap } from 'lucide-react';
import { siteContent } from '../../config/siteContent';

interface AccessibleSectionProps {
  onSelectRoute?: (from: string, to: string) => void;
}

export function AccessibleSection({ onSelectRoute }: AccessibleSectionProps) {
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  return (
    <section
      id="accessible"
      className="accessible-section relative min-h-screen w-full flex items-center px-6 sm:px-12 md:px-16 lg:px-24 py-20 pointer-events-none"
    >
      {/* Frosted Dark Glass Panel Container */}
      <div className="max-w-2xl text-left pointer-events-auto z-10 space-y-6 bg-[#202A36]/70 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-8 md:p-10">
        {/* Section Tag */}
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#D9BF8C] block">
          {siteContent.accessible.tag}
        </span>

        {/* Heading */}
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.95] text-white">
          Accessible<span className="text-[#D9BF8C]">.</span>
        </h2>

        {/* 2 lines on flexible booking, 1-hour dispatch, and airports */}
        <div className="space-y-3 font-sans text-base md:text-lg text-[#E6E9EE] leading-relaxed font-normal">
          <p>{siteContent.accessible.line1}</p>
          <p className="text-[#E6E9EE]/85">{siteContent.accessible.line2}</p>
        </div>

        {/* Key Operational Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {siteContent.accessible.points.map((point, index) => (
            <div
              key={`point-${index}`}
              className="flex items-start gap-2.5 text-xs md:text-sm text-[#E6E9EE] bg-white/5 border border-white/10 backdrop-blur-md p-3.5 rounded-2xl"
            >
              <Zap className="w-4 h-4 text-[#D9BF8C] shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Active Transcontinental Routes Preview */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-[#AEB6C2] mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D9BF8C]" />
            <span>Frequent Global City Pairs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {siteContent.accessible.sampleRoutes.map((route, idx) => {
              const isActive = activeRouteIndex === idx;
              return (
                <div
                  key={`route-${idx}`}
                  onClick={() => {
                    setActiveRouteIndex(idx);
                    onSelectRoute?.(route.from, route.to);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D9BF8C]/15 border-[#D9BF8C] shadow-lg shadow-[#D9BF8C]/10 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-[#E6E9EE]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                    <span>{route.fromCode}</span>
                    <ArrowRight className="w-3 h-3 text-[#D9BF8C]" />
                    <span>{route.toCode}</span>
                  </div>
                  <div className="text-[11px] text-[#AEB6C2] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D9BF8C]/80" />
                      {route.duration}
                    </span>
                    <span className="truncate max-w-[90px]">{route.aircraft.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
