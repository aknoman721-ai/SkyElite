import React from 'react';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import { siteContent } from '../../config/siteContent';

interface FinalCtaSectionProps {
  onBookNow: () => void;
}

export function FinalCtaSection({ onBookNow }: FinalCtaSectionProps) {
  return (
    <div className="relative w-full z-10 pointer-events-auto">
      {/* Final CTA Billboard on Frosted Dark Glass Panel */}
      <section
        id="final-cta"
        className="final-cta-section relative min-h-[85vh] w-full flex flex-col justify-center items-center text-center px-6 md:px-16 py-24"
      >
        <div className="max-w-3xl mx-auto space-y-6 bg-[#202A36]/70 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#D9BF8C] block">
            {siteContent.brand.name} AIRCRAFT CHARTER
          </span>

          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.95] text-white">
            Your dedication deserves <span className="text-[#D9BF8C]">recognition.</span>
          </h2>

          <p className="font-sans text-base md:text-xl text-[#E6E9EE] max-w-xl mx-auto leading-relaxed">
            {siteContent.finalCta.subtext}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onBookNow}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-[#202A36] bg-[#D9BF8C] hover:bg-[#E8D3A8] font-sans font-semibold text-sm transition-all duration-300 shadow-xl shadow-[#D9BF8C]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{siteContent.finalCta.ctaButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`tel:${siteContent.finalCta.phone.replace(/[^0-9+]/g, '')}`}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans font-medium text-sm transition-colors border border-white/20 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#D9BF8C]" />
              <span>{siteContent.finalCta.phone}</span>
            </a>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs font-sans text-[#AEB6C2]">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D9BF8C]" />
              {siteContent.finalCta.email}
            </span>
            <span>·</span>
            <span>Worldwide 24/7 Operations</span>
          </div>
        </div>
      </section>

      {/* Simple refined footer */}
      <footer className="w-full border-t border-white/10 bg-[#202A36]/90 backdrop-blur-xl px-8 md:px-16 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#AEB6C2]">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-display font-normal text-white text-xl">
              {siteContent.brand.name}
            </div>
            <p className="font-sans">{siteContent.footer.copyright}</p>
            <p className="font-sans text-[11px] text-[#AEB6C2]/70 max-w-xl">
              {siteContent.footer.disclaimer}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-sans text-[#AEB6C2] font-medium">
            {siteContent.footer.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#D9BF8C] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
