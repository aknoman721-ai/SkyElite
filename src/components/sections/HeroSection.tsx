import React, { useRef, useState } from 'react';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { siteContent } from '../../config/siteContent';

interface HeroSectionProps {
  onDiscover: () => void;
  onBookNow: () => void;
}

export function HeroSection({ onDiscover, onBookNow }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section
      id="hero"
      className="hero-section relative h-screen w-full overflow-hidden"
    >
      {/* Exact CloudFront Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle top vignette for crystal clear text legibility while preserving photorealism */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none z-[1]" />

      {/* Content wrapper: relative, h-full, flex flex-col */}
      <div className="content-wrapper relative h-full flex flex-col z-10 pointer-events-none">
        {/* Spacer for fixed navigation bar */}
        <div className="h-24 w-full shrink-0" />

        {/* Main content area: flex-1, flex items-center justify-center */}
        <div className="main-content-area flex-1 flex items-center justify-center">
          {/* Hero Content: centered, -mt-80 to pull up */}
          <div className="hero-content text-center px-4 -mt-36 sm:-mt-56 md:-mt-80 pointer-events-auto max-w-4xl mx-auto">
            {/* Small uppercase label: "PRIVATE JETS" */}
            <p className="text-sm font-semibold text-gray-600 tracking-wider mb-4 uppercase">
              {siteContent.hero.categoryLabel}
            </p>

            {/* Large two-line heading with overlapping effect */}
            <div className="flex flex-col items-center justify-center select-none">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-normal text-gray-500 leading-none tracking-tighter">
                {siteContent.hero.headlineLine1}
              </h1>
              <h1
                className="text-6xl md:text-7xl lg:text-8xl font-normal text-[#202A36] leading-none tracking-tighter"
                style={{ marginTop: '-12px' }}
              >
                {siteContent.hero.headlineLine2}
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mt-5 mb-6 max-w-2xl mx-auto font-normal">
              {siteContent.hero.subtitle}
            </p>

            {/* Two call-to-action buttons (gap-4, centered) */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onDiscover}
                className="px-4 py-2 rounded-full bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition-colors shadow-sm cursor-pointer"
              >
                {siteContent.hero.secondaryButton}
              </button>
              <button
                onClick={onBookNow}
                className="px-4 py-2 rounded-full text-white bg-[#202A36] hover:bg-[#1a2229] font-medium transition-colors shadow-sm cursor-pointer"
              >
                {siteContent.hero.primaryButton}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar with sound toggle and pulsing scroll indicator */}
        <div className="hero-scroll-indicator pb-8 px-8 flex items-center justify-between pointer-events-auto">
          {/* Subtle audio ambient toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full bg-white/70 hover:bg-white/90 text-gray-700 backdrop-blur-sm border border-white/60 shadow-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
            title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium hidden sm:inline">
              {isMuted ? 'Sound' : 'Playing'}
            </span>
          </button>

          {/* Pulsing Scroll Indicator */}
          <div className="flex flex-col items-center opacity-75 hover:opacity-100 transition-opacity">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
              {siteContent.hero.scrollIndicator}
            </span>
            <div className="animate-bounce">
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          {/* Spacer to balance audio toggle */}
          <div className="w-16" />
        </div>
      </div>
    </section>
  );
}

