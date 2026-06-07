import React from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useAppStore } from '../store/useAppStore';
import { triggerDownload } from '../lib/export';

export const ExportPreviewModal: React.FC = () => {
  const previewDataUrl = useAppStore(state => state.previewDataUrl);
  const previewType = useAppStore(state => state.previewType);
  const setPreview = useAppStore(state => state.setPreview);

  if (!previewDataUrl) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setPreview(null)}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-slate-50 dark:bg-slate-900 border-none rounded-3xl shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <DialogTitle className="text-xl font-bold">Export Preview</DialogTitle>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPreview(null)}>Cancel</Button>
            <Button onClick={() => triggerDownload(previewDataUrl, `schema-diagram.${previewType}`)}>
              Download {previewType?.toUpperCase()}
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-b-3xl">
          {/* We use an img tag for all types, as browsers can render data URIs natively */}
          <img src={previewDataUrl} alt="Preview" className="max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
