'use client';

import { useEffect, useState, useCallback } from 'react';

interface SiteHealth {
  url: string;
  name: string;
  online: boolean;
  responseTime: number;
  metaTagHealth: number;
  checksPassedCount: number;
  totalChecks: number;
  checks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
}

interface EcosystemHealthData {
  overallHealth: number;
  lastChecked: string;
  sites: SiteHealth[];
}

export default function EcosystemHealthTab() {
  const [healthData, setHealthData] = useState<EcosystemHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/ecosystem-health');
      const data = await response.json();

      if (response.ok) {
        setHealthData(data);
      } else {
        setError(data.error || 'Failed to check ecosystem health');
      }
    } catch (err) {
      setError('Failed to connect to health check service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-500';
    if (health >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getResponseTimeLabel = (ms: number) => {
    if (ms < 200) return 'Excellent';
    if (ms < 500) return 'Good';
    if (ms < 1000) return 'Fair';
    return 'Slow';
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  if (loading && !healthData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Checking ecosystem health...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🐘 Ecosystem Health Monitor
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time monitoring of havanaelephant.com and contentlynk.com
            </p>
            {healthData && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                Last checked: {formatTime(healthData.lastChecked)}
              </p>
            )}
          </div>
          <div className="text-right">
            {healthData && (
              <div className="mb-4">
                <span className={`text-5xl font-bold ${getHealthColor(healthData.overallHealth)}`}>
                  {healthData.overallHealth.toFixed(1)}%
                </span>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Overall Health</p>
              </div>
            )}
            <button
              onClick={checkHealth}
              disabled={loading}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Checking...
                </>
              ) : (
                <>
                  🔄 Refresh Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Site Health Cards */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthData.sites.map((site) => (
            <div key={site.url} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {site.name}
                  </h3>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  >
                    {site.url} →
                  </a>
                </div>
                <div className={`w-4 h-4 rounded-full ${site.online ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>

              {/* Meta Tag Health */}
              <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Meta Tag Health</span>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${getHealthColor(site.metaTagHealth)}`}>
                    {site.metaTagHealth.toFixed(1)}%
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {site.checksPassedCount} / {site.totalChecks} checks passed
                  </p>
                </div>
              </div>

              {/* Response Time */}
              <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {getResponseTimeLabel(site.responseTime)}
                  </p>
                </div>
                <span className={`text-2xl font-bold ${site.responseTime < 200 ? 'text-green-500' : site.responseTime < 500 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {site.responseTime}ms
                </span>
              </div>

              {/* Meta Tag Checks */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Meta Tag Checks</h4>
                <div className="space-y-2">
                  {site.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{check.name}</span>
                      <span className={check.passed ? 'text-green-500' : 'text-red-500'}>
                        {check.passed ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
