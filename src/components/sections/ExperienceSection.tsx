import React, { useRef, useState } from 'react';
import { Check, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { siteContent, ExperienceCard } from '../../config/siteContent';

interface TiltCardProps {
  card: ExperienceCard;
  index: number;
}

function TiltCard({ card }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const getCardIcon = (id: string) => {
    switch (id) {
      case 'concierge':
        return <UserCheck className="w-5 h-5 text-[#D9BF8C]" />;
      case 'privacy':
        return <Lock className="w-5 h-5 text-[#D9BF8C]" />;
      case 'safety':
        return <ShieldCheck className="w-5 h-5 text-[#D9BF8C]" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-[#D9BF8C]" />;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
      }}
      className="experience-card relative bg-[#202A36]/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl hover:border-[#D9BF8C]/40 flex flex-col justify-between transition-colors pointer-events-auto"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            {getCardIcon(card.id)}
          </div>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#D9BF8C] bg-[#D9BF8C]/15 border border-[#D9BF8C]/30 px-2.5 py-0.5 rounded-full">
            {card.badge}
          </span>
        </div>

        <span className="text-xs font-sans font-semibold text-[#AEB6C2] uppercase tracking-[0.15em] block mb-1">
          {card.category}
        </span>
        <h3 className="font-display text-2xl font-normal text-white tracking-tight mb-2">
          {card.title}
        </h3>
        <p className="text-xs md:text-sm font-sans text-[#E6E9EE] leading-relaxed mb-6">
          {card.description}
        </p>
      </div>

      <div className="space-y-2.5 pt-4 border-t border-white/10">
        {card.details.map((detail, idx) => (
          <div key={`detail-${idx}`} className="flex items-center gap-2 text-xs font-sans text-[#AEB6C2]">
            <Check className="w-3.5 h-3.5 text-[#D9BF8C] shrink-0" />
            <span>{detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="experience-section relative min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-24 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header on Frosted Dark Glass Panel */}
        <div className="max-w-2xl text-left mb-10 pointer-events-auto z-10 space-y-3 bg-[#202A36]/70 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-8 md:p-10">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#D9BF8C] block">
            {siteContent.experience.tag}
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[0.95] text-white">
            The SkyElite <span className="text-[#D9BF8C]">Standard.</span>
          </h2>
          <p className="font-sans text-base md:text-lg text-[#E6E9EE] font-normal leading-relaxed">
            {siteContent.experience.subtitle}
          </p>
        </div>

        {/* Three Glass Cards that stagger in with hover tilt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siteContent.experience.cards.map((card, idx) => (
            <TiltCard key={card.id} card={card} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
