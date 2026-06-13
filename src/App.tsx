import { useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExportPreviewModal } from './components/ExportPreviewModal';
import { useAppStore } from './store/useAppStore';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './components/ui/sheet';
import { Topbar } from './components/Topbar';

const DiagramCanvas = lazy(() => import('./components/DiagramCanvas').then(m => ({ default: m.DiagramCanvas })));
const ExportOverlay = lazy(() => import('./components/ExportOverlay').then(m => ({ default: m.ExportOverlay })));

const Loader = () => (
  <div className="flex-1 flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
  </div>
);

function App() {
  const code = useAppStore(state => state.code);
  const compile = useAppStore(state => state.compile);
  const theme = useAppStore(state => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Auto-compile on first load to render shared schema
    setTimeout(() => {
      useAppStore.getState().compile(true);
    }, 100);
  }, []);

  useEffect(() => {
    compile();
  }, [code, compile]);

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-background text-foreground font-sans transition-colors duration-300">
      <Suspense fallback={<Loader />}>
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full border-r border-slate-200/50 dark:border-white/5">
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 min-w-0 relative h-full">
          <Topbar />
          
          <div className="flex-1 relative bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden">
            <DiagramCanvas />
            <ExportPreviewModal />
            
            {/* Mobile Sidebar Trigger (FAB) */}
            <Sheet>
              <SheetTrigger className="md:hidden absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground z-50 flex items-center justify-center">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[340px] max-w-[90vw] border-r-0 bg-[#1e1e1e]">
                <SheetTitle className="sr-only">Editor Sidebar</SheetTitle>
                <SheetDescription className="sr-only">Live DSL Editor</SheetDescription>
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <ExportOverlay />
      </Suspense>
    </div>
  );
}

export default App;
