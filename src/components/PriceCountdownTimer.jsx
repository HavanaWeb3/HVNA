import React, { useState, useEffect } from 'react';

const PriceCountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // FIXED: Phase 1 ends on February 28, 2026 at 11:59:59 PM UTC
    // This date NEVER changes - countdown will accurately show time remaining until this exact moment
    const endDate = new Date('2026-02-28T23:59:59Z'); // Z = UTC timezone

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      // If countdown has ended, show zeros
      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 rounded-lg text-white text-center shadow-xl">
      <div className="text-sm font-semibold mb-2 uppercase tracking-wide">
        {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0
          ? '✅ PHASE 1 COMPLETE'
          : '⏰ PHASE 1 ENDS IN:'}
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-4 font-mono" id="countdown">
        {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0
          ? 'PHASE 2 ACTIVE'
          : `${formatTime(timeLeft.days)}d ${formatTime(timeLeft.hours)}h ${formatTime(timeLeft.minutes)}m ${formatTime(timeLeft.seconds)}s`}
      </div>
      <div className="flex justify-center gap-8 text-sm md:text-base">
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-white/80 text-xs uppercase">Current Price</div>
          <div className="font-bold text-2xl">€0.01</div>
        </div>
        <div className="flex items-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-white/80 text-xs uppercase">Next Phase</div>
          <div className="font-bold text-2xl">€0.05</div>
          <div className="text-xs text-white/90">+400% increase</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-white/90">
        ⚡ Lock in your price before it increases!
      </div>
    </div>
  );
};

export default PriceCountdownTimer;
