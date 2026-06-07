import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useEffect, useRef } from 'react';
import { Loader2, TerminalSquare, CheckCircle2 } from 'lucide-react';

export const ExportOverlay = () => {
  const isExporting = useAppStore(s => s.isExporting);
  const exportTitle = useAppStore(s => s.exportTitle);
  const exportProgress = useAppStore(s => s.exportProgress);
  const exportLogs = useAppStore(s => s.exportLogs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [exportLogs]);

  return (
    <AnimatePresence>
      {isExporting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-xl flex flex-col overflow-hidden relative"
          >
            <div className="flex flex-col items-center">
              {exportProgress < 100 ? (
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              )}
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 tracking-tight">{exportTitle}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center font-medium">Please wait while the rendering engine processes your diagram.</p>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden relative">
                <motion.div
                  className="bg-primary h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="w-full flex justify-between mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Progress</span>
                <span className="text-primary">{Math.round(exportProgress)}%</span>
              </div>
            </div>

            <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
                <TerminalSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Process Logs</span>
              </div>
              <div 
                ref={scrollRef}
                className="p-4 h-40 overflow-y-auto font-mono text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed custom-scrollbar"
              >
                {exportLogs.map((log, i) => {
                  const isSystem = log.includes('[System]');
                  const isSuccess = log.includes('[Success]');
                  const isError = log.includes('[Error]');
                  return (
                    <div key={i} className="mb-1 flex items-start opacity-90 hover:opacity-100 transition-opacity">
                      <span className="text-slate-300 dark:text-slate-600 mr-2 shrink-0">{'>'}</span>
                      <span className={isSystem ? 'text-blue-500 font-semibold' : isSuccess ? 'text-emerald-500 font-semibold' : isError ? 'text-rose-500 font-semibold' : ''}>
                        {log}
                      </span>
                    </div>
                  );
                })}
                {exportProgress < 100 && (
                  <div className="animate-pulse mt-1 flex items-center">
                    <span className="text-slate-300 dark:text-slate-600 mr-2">{'>'}</span>
                    <div className="w-1.5 h-3 bg-primary" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
