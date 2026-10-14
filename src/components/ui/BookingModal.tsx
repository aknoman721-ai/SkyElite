import React, { useState } from 'react';
import { X, Check, Plane, Calendar, Users, Shield, ArrowRight } from 'lucide-react';
import { siteContent } from '../../config/siteContent';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JetTier {
  id: string;
  name: string;
  capacity: string;
  speed: string;
  ratePerHour: number;
  description: string;
}

const JET_TIERS: JetTier[] = [
  {
    id: 'midsize',
    name: 'Midsize Jet (Citation Latitude)',
    capacity: '7-8 Passengers',
    speed: '495 mph',
    ratePerHour: 6200,
    description: 'Optimal for transcontinental nonstop routes up to 5 hours.',
  },
  {
    id: 'heavy',
    name: 'Super Midsize (Challenger 350)',
    capacity: '9-10 Passengers',
    speed: '528 mph',
    ratePerHour: 8400,
    description: 'Full stand-up cabin, flat berths, and coast-to-coast range.',
  },
  {
    id: 'ultra',
    name: 'Ultra Long Range (Gulfstream G650ER)',
    capacity: '14-16 Passengers',
    speed: '590 mph',
    ratePerHour: 12800,
    description: 'Global reach (7,500 nm), 4 living zones, and master bedroom.',
  },
];

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [origin, setOrigin] = useState('New York, NY (KTEB - Teterboro)');
  const [destination, setDestination] = useState('London, UK (EGLF - Farnborough)');
  const [date, setDate] = useState('2026-10-15');
  const [passengers, setPassengers] = useState(4);
  const [selectedTier, setSelectedTier] = useState<string>('ultra');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentTier = JET_TIERS.find((t) => t.id === selectedTier) || JET_TIERS[2];
  const estimatedFlightHours = 6.2;
  const estimatedTotal = Math.round(currentTier.ratePerHour * estimatedFlightHours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-gray-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                {siteContent.brand.name} Charter Dispatch
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                Instant Quote
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Guaranteed aircraft availability within 60 minutes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 max-h-[82vh] overflow-y-auto space-y-5">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Departure Airport (FBO)
                </label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#202A36]"
                    placeholder="City or Airport Code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Arrival Airport (FBO)
                </label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3 w-4 h-4 text-gray-400 rotate-90" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#202A36]"
                    placeholder="City or Airport Code"
                  />
                </div>
              </div>
            </div>

            {/* Date & Passengers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Departure Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#202A36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Passengers
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#202A36]"
                  >
                    {[1, 2, 4, 6, 8, 10, 12, 14, 16].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Aircraft Tier Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Preferred Airframe Class
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {JET_TIERS.map((tier) => {
                  const isSelected = selectedTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-colors ${
                        isSelected
                          ? 'border-[#202A36] bg-gray-50/80 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm text-gray-900">
                          {tier.name}
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          ${tier.ratePerHour.toLocaleString()} <span className="text-gray-400 text-[10px]">/ hr</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{tier.capacity}</span>
                        <span>·</span>
                        <span>Cruise: {tier.speed}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-gray-100/80 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block">
                  Estimated Charter Investment
                </span>
                <span className="text-2xl font-semibold text-[#202A36] tabular-nums">
                  ${estimatedTotal.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-gray-500">USD est. all-in</span>
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Includes FBO fees, fuel surcharge, and in-flight VIP catering.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Shield className="w-4 h-4 text-gray-700" />
                <span>Wyvern & ARGUS Platinum</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#202A36]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Private Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="marcus@vancecapital.com"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#202A36]"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-full text-white bg-[#202A36] hover:bg-[#1a2229] font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>Request Flight Confirmation & Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2">
                No immediate payment required. A flight director will confirm tail assignment within 15 minutes.
              </p>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Flight Request Dispatched
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Your itinerary for <strong className="text-gray-900">{origin}</strong> to{' '}
              <strong className="text-gray-900">{destination}</strong> has been assigned to flight operations. A SkyElite flight director is reviewing ramp slots and will contact {email || 'you'} shortly.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-[#202A36] text-white text-sm font-medium hover:bg-[#1a2229] transition-colors"
              >
                Return to Experience
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
