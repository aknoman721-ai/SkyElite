import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { siteContent } from '../../config/siteContent';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onOpenBooking: () => void;
}

export function Navbar({ onNavigate, onOpenBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (targetId: string) => {
    onNavigate(targetId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full pointer-events-auto">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Brand name */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="text-2xl font-semibold text-gray-900 tracking-tight hover:opacity-85 transition-opacity cursor-pointer text-left"
          >
            {siteContent.brand.name}
          </button>

          {/* Desktop menu items */}
          <nav className="hidden md:flex items-center gap-8">
            {siteContent.navigation.links.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.target)}
                className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}

            {/* Quick CTA */}
            <button
              onClick={onOpenBooking}
              className="ml-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#202A36] hover:bg-[#1a2229] transition-colors shadow-sm cursor-pointer"
            >
              {siteContent.navigation.cta}
            </button>
          </nav>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white bg-[#202A36] hover:bg-[#1a2229] transition-colors"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-900 hover:text-gray-700 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 flex flex-col space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {siteContent.navigation.links.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.target)}
                className="text-left text-base font-medium text-gray-900 hover:text-gray-700 transition-colors py-1"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-2.5 px-4 rounded-full text-center text-sm font-medium text-white bg-[#202A36] hover:bg-[#1a2229] transition-colors"
              >
                {siteContent.navigation.cta}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
