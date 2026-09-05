import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  X,
  Zap,
  RefreshCw,
  Globe,
  Gauge,
  SignalHigh,
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { runNetworkTest, NetworkDiagnosticResult } from '../../services/tauri';

export interface NetworkTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkTestModal: React.FC<NetworkTestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NetworkDiagnosticResult | null>(null);

  const executeTest = async () => {
    setIsLoading(true);
    try {
      const data = await runNetworkTest();
      setResult(data);
    } catch (err) {
      console.error('Network diagnostic failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-3xl border border-border/80 bg-card shadow-2xl shadow-blue-500/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Diagnostik Kecepatan & Jaringan Media
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pengujian latensi round-trip TCP ke CDN YouTube, TikTok, dan
                  Instagram
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-5 space-y-4">
            {/* Overview Metric Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 border border-blue-500/20">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                    <SignalHigh className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Status Jaringan</span>
                  </div>
                  <div className="text-sm font-black text-foreground flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{result?.is_online ? 'Terhubung' : 'Offline'}</span>
                  </div>
                </div>

                <div className="space-y-1 border-x border-border/40 px-2">
                  <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rata-rata Ping</span>
                  </div>
                  <div className="text-sm font-black font-mono text-purple-600 dark:text-purple-400">
                    {isLoading ? '...' : `${result?.avg_latency_ms ?? 0} ms`}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-blue-500" />
                    <span>Kualitas Streaming</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 line-clamp-1">
                    {isLoading
                      ? 'Menguji...'
                      : (result?.quality_tier ?? 'Optimal')}
                  </div>
                </div>
              </div>

              {result?.download_bandwidth_est && !isLoading && (
                <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Estimasi Bandwidth Unduhan:
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {result.download_bandwidth_est}
                  </span>
                </div>
              )}
            </div>

            {/* CDN Endpoint Latency List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-500" />
                  <span>Latensi CDN Media Global</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Target Port: 443 HTTPS
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Sedang mengukur round-trip time ke server CDN...
                    </p>
                  </div>
                ) : (
                  result?.endpoints.map((ep, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <div className="font-semibold text-foreground">
                            {ep.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {ep.host}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ep.status === 'Optimal'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : ep.status === 'Good'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {ep.status}
                        </span>
                        <span className="font-mono font-bold text-foreground w-14 text-right">
                          {ep.latency_ms} ms
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-border/60 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Tutup
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoading}
              onClick={executeTest}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>
                {isLoading ? 'Menguji Jaringan...' : 'Uji Ulang Latensi'}
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
