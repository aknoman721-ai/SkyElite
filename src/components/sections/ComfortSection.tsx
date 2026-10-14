import React from 'react';
import { Armchair, UtensilsCrossed, Wifi } from 'lucide-react';
import { siteContent } from '../../config/siteContent';

export function ComfortSection() {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Armchair':
        return <Armchair className="w-5 h-5 text-[#D9BF8C]" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-[#D9BF8C]" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-[#D9BF8C]" />;
      default:
        return <Armchair className="w-5 h-5 text-[#D9BF8C]" />;
    }
  };

  return (
    <section
      id="comfort"
      className="comfort-section relative min-h-screen w-full flex items-center justify-end px-6 sm:px-12 md:px-16 lg:px-24 py-20 pointer-events-none"
    >
      {/* Frosted Dark Glass Panel Container */}
      <div className="max-w-xl text-left pointer-events-auto z-10 space-y-6 bg-[#202A36]/70 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-8 md:p-10">
        {/* Section Tag */}
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#D9BF8C] block">
          {siteContent.comfort.tag}
        </span>

        {/* Heading */}
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.95] text-white">
          Comfort<span className="text-[#D9BF8C]">.</span>
        </h2>

        {/* Lines on quiet cabin, lie-flat seats, fine dining, Wi-Fi */}
        <div className="space-y-3 font-sans text-base md:text-lg text-[#E6E9EE] leading-relaxed font-normal">
          <p>{siteContent.comfort.line1}</p>
          <p className="text-[#E6E9EE]/85">{siteContent.comfort.line2}</p>
        </div>

        {/* Three-Icon Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {siteContent.comfort.features.map((feature) => (
            <div
              key={feature.id}
              className="comfort-card p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#D9BF8C]/40 hover:bg-white/10 transition-all duration-200 space-y-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                {getIcon(feature.iconName)}
              </div>
              <div className="font-sans text-xs font-semibold text-white tracking-wide">
                {feature.title}
              </div>
              <div className="font-sans text-[11px] text-[#AEB6C2] leading-relaxed">
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
