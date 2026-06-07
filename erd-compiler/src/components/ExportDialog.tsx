import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { exportCanvas } from '../lib/export';
import { ImageIcon, Video } from 'lucide-react';

export const ExportDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [pngScale, setPngScale] = useState(4);
  const [gifScale, setGifScale] = useState(1);
  const [gifFrames, setGifFrames] = useState(15);
  const [gifDelay, setGifDelay] = useState(66);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md px-3 h-8 text-xs font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 gap-1.5 transition-colors">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-slate-900 text-slate-100 border-slate-800 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4 border-b border-slate-800 pb-4">
            <h4 className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Static Image Export</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Resolution Scaling</label>
                <div className="flex bg-slate-800 p-1 rounded-xl">
                  {[1, 2, 4, 8].map(s => (
                    <button key={s} onClick={() => setPngScale(s)} className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${pngScale === s ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                      {s === 1 ? '1x' : s === 2 ? '2x' : s === 4 ? '4x (HD)' : '8x (Ultra)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full border-0" onClick={() => { exportCanvas('png', { scale: pngScale }); setOpen(false); }}>
                Export PNG
              </Button>
              <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-slate-700" onClick={() => { exportCanvas('svg'); setOpen(false); }}>
                Export SVG
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2"><Video className="w-4 h-4"/> Animated GIF Export</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Resolution</label>
                <select className="w-full bg-slate-800 rounded-xl px-2 py-1.5 text-sm border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" value={gifScale} onChange={e => setGifScale(Number(e.target.value))}>
                  <option value={1}>1x Standard</option>
                  <option value={2}>2x High</option>
                  <option value={4}>4x Ultra</option>
                  <option value={8}>8x Maximum</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Frames</label>
                <select className="w-full bg-slate-800 rounded-xl px-2 py-1.5 text-sm border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" value={gifFrames} onChange={e => setGifFrames(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Delay</label>
                <select className="w-full bg-slate-800 rounded-xl px-2 py-1.5 text-sm border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" value={gifDelay} onChange={e => setGifDelay(Number(e.target.value))}>
                  <option value={33}>30fps</option>
                  <option value={66}>15fps</option>
                  <option value={100}>10fps</option>
                </select>
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full border-0 font-medium h-10 mt-2" onClick={() => { exportCanvas('gif', { scale: gifScale, frames: gifFrames, delay: gifDelay }); setOpen(false); }}>
              Generate Animated GIF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
