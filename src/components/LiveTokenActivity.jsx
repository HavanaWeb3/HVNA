import React, { useState, useEffect } from 'react';

const LiveTokenActivity = () => {
  const [activities, setActivities] = useState([]);

  // Generate random activity entries on mount
  useEffect(() => {
    const generateActivities = () => {
      const getRandomTokens = () => {
        // Random between 10,000 and 1,000,000 (max €10,000 at €0.01/token)
        return Math.floor(Math.random() * (1000000 - 10000) + 10000);
      };

      const getRandomTime = () => {
        // Random minutes ago between 1 and 60
        return Math.floor(Math.random() * 60) + 1;
      };

      return [
        {
          id: 1,
          tokens: getRandomTokens(),
          time: getRandomTime(),
          phase: 'Seed Round'
        },
        {
          id: 2,
          tokens: getRandomTokens(),
          time: getRandomTime() + 10,
          phase: 'Seed Round'
        },
        {
          id: 3,
          tokens: getRandomTokens(),
          time: getRandomTime() + 20,
          phase: 'Seed Round'
        }
      ].sort((a, b) => a.time - b.time);
    };

    setActivities(generateActivities());

    // Update timestamps every minute
    const interval = setInterval(() => {
      setActivities(prev => prev.map(activity => ({
        ...activity,
        time: activity.time + 1
      })));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed right-4 top-24 w-80 bg-white rounded-lg shadow-2xl p-6 z-40 hidden lg:block">
      <h3 className="text-xl font-bold mb-4 text-orange-500 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        LIVE TOKEN ACTIVITY
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border-b border-gray-200 pb-3 last:border-0">
            <div className="text-sm text-gray-500 mb-1">
              ⏱ {activity.time} minute{activity.time !== 1 ? 's' : ''} ago
            </div>
            <div className="font-semibold text-gray-900">
              Anonymous: {activity.tokens.toLocaleString()} $HVNA
            </div>
            <div className="text-sm text-gray-600 flex justify-between mt-1">
              <span>Value: €{(activity.tokens * 0.01).toLocaleString()}</span>
              <span className="text-orange-500">{activity.phase}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          🔐 Privacy Protected - All purchases anonymous
        </div>
      </div>
    </div>
  );
};

export default LiveTokenActivity;
