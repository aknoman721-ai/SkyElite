export interface StatItem {
  value: string;
  number: number;
  suffix: string;
  label: string;
  sublabel: string;
}

export interface ExperienceCard {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  details: string[];
}

export interface ComfortFeature {
  id: string;
  iconName: 'Armchair' | 'UtensilsCrossed' | 'Wifi';
  title: string;
  description: string;
}

export interface RouteItem {
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  duration: string;
  aircraft: string;
}

export const siteContent = {
  brand: {
    name: 'SkyElite',
    tagline: 'Private Aviation Refined',
    accentColor: '#202A36',
  },
  navigation: {
    links: [
      { label: 'Start', target: 'hero' },
      { label: 'Story', target: 'premium' },
      { label: 'Rates', target: 'accessible' },
      { label: 'Benefits', target: 'comfort' },
      { label: 'FAQ', target: 'experience' },
    ],
    cta: 'Book Now',
  },
  hero: {
    categoryLabel: 'PRIVATE JETS',
    headlineLine1: 'Premium.',
    headlineLine2: 'Accessible.',
    subtitle: 'Your dedication deserves recognition.',
    primaryButton: 'Book Now',
    secondaryButton: 'Discover',
    scrollIndicator: 'Scroll to explore',
  },
  premium: {
    tag: '01 / CRAFTSMANSHIP & FLEET',
    headline: 'Premium.',
    line1: 'Bespoke hand-finished aeronautical cabins sculpted from tactile Connolly leather and matte-cured carbon composite.',
    line2: 'Every airframe in our heavy and ultra-long-range fleet is maintained well beyond FAA Part 135 and EASA specifications.',
    stats: [
      {
        value: '180+',
        number: 180,
        suffix: '+',
        label: 'Vetted Aircraft',
        sublabel: 'Gulfstream, Bombardier & Dassault',
      },
      {
        value: '15+',
        number: 15,
        suffix: ' Yrs',
        label: 'Aviation Pedigree',
        sublabel: 'Zero safety compromises since inception',
      },
      {
        value: '100%',
        number: 100,
        suffix: '%',
        label: 'Safety Record',
        sublabel: 'ARGUS Platinum & Wyvern Wingman certified',
      },
    ] as StatItem[],
  },
  accessible: {
    tag: '02 / ON-DEMAND MOBILITY',
    headline: 'Accessible.',
    line1: 'Direct tarmac boarding with under 60-minute scramble times across North America, Europe, and the Middle East.',
    line2: 'Transparent flat hourly rates with zero upfront capital calls, zero membership locking, and immediate guaranteed availability.',
    points: [
      '5,400+ private FBO terminals bypassing commercial congestion',
      'Dedicated flight coordinator assigned within 3 minutes of request',
      'Dynamic empty-leg repositioning access at up to 45% reduction',
      'Guaranteed aircraft substitution within 90 minutes anywhere in network',
    ],
    sampleRoutes: [
      {
        from: 'New York (Teterboro)',
        to: 'London (Farnborough)',
        fromCode: 'KTEB',
        toCode: 'EGLF',
        duration: '5h 50m',
        aircraft: 'Gulfstream G650ER',
      },
      {
        from: 'Geneva (Cointrin)',
        to: 'Dubai (Al Maktoum)',
        fromCode: 'LSGG',
        toCode: 'OMDW',
        duration: '6h 15m',
        aircraft: 'Bombardier Global 7500',
      },
      {
        from: 'Los Angeles (Van Nuys)',
        to: 'Miami (Opa-locka)',
        fromCode: 'KVNY',
        toCode: 'KOPF',
        duration: '4h 30m',
        aircraft: 'Challenger 350',
      },
    ] as RouteItem[],
  },
  comfort: {
    tag: '03 / INTERIOR SANCTUARY',
    headline: 'Comfort.',
    line1: 'A whisper-quiet 48 dB pressurized sanctuary calibrated to a low 3,800 ft cabin altitude for restorative long-haul rest.',
    line2: 'Full flat-berth sleeping configurations, Michelin-curated in-flight dining, and gigabit satellite connectivity in every seat.',
    features: [
      {
        id: 'seating',
        iconName: 'Armchair',
        title: 'Executive Ergonomics',
        description: 'Multi-density memory foam seating with 180° flat berths, gentle pneumatic massage, and ergonomic lumbar cradling.',
      },
      {
        id: 'dining',
        iconName: 'UtensilsCrossed',
        title: 'Curated Gastronomy',
        description: 'Sommelier-paired wine reserves and bespoke catering crafted fresh by regional culinary ateliers.',
      },
      {
        id: 'wifi',
        iconName: 'Wifi',
        title: 'Low-Latency Starlink',
        description: 'Uninterrupted 250 Mbps satellite uplink for real-time video conferencing and high-definition media streaming.',
      },
    ] as ComfortFeature[],
  },
  experience: {
    tag: '04 / DISTINCTION',
    headline: 'The SkyElite Standard.',
    subtitle: 'Every flight is orchestrated as an uncompromised private journey.',
    cards: [
      {
        id: 'concierge',
        title: '24/7 Air Concierge',
        category: 'Personal Service',
        badge: 'Dedicated Team',
        description: 'A personal dispatch director manages ground tarmac transfers, customs fast-tracking, and customs pre-clearance.',
        details: [
          'Direct tarmac limousine pull-up',
          'Dietary and cabin preference memorization',
          'Discreet pet-friendly travel accommodations',
        ],
      },
      {
        id: 'privacy',
        title: 'Absolute Discretion',
        category: 'Confidentiality',
        badge: 'Private Manifest',
        description: 'Protected flight manifests, secure private FBO hangars, and non-disclosure operational standards for high-profile clients.',
        details: [
          'Encrypted passenger manifests',
          'Private customs and immigration clearance',
          'Zero public tail-number broadcasting option',
        ],
      },
      {
        id: 'safety',
        title: 'Rigorous Airworthiness',
        category: 'Flight Safety',
        badge: 'Dual Captain Standard',
        description: 'Every flight crewed by two type-rated captains with an average of over 7,500 command hours and bi-annual simulator drills.',
        details: [
          'ARGUS Platinum rated operators only',
          'Dual pilot-in-command crewing',
          'Pre-flight 84-point mechanical verification',
        ],
      },
    ] as ExperienceCard[],
  },
  finalCta: {
    headline: 'Your dedication deserves recognition.',
    subtext: 'Step aboard an aircraft tailored around your schedule, standards, and ambition. Inquire today for priority flight dispatch.',
    ctaButton: 'Book Now',
    secondaryButton: 'Speak with Flight Ops',
    phone: '+1 (800) 892-3548',
    email: 'charter@skyelite-aviation.com',
  },
  footer: {
    copyright: '© 2026 SkyElite Aviation Inc. All rights reserved.',
    disclaimer: 'SkyElite arranges flights on behalf of clients with Part 135 certified air carriers who maintain operational control of all flights.',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Charter', href: '#' },
      { label: 'Safety Standards', href: '#' },
      { label: 'Operator Portal', href: '#' },
    ],
  },
};
