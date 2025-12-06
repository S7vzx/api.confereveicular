import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import SobreNos from "./pages/SobreNos";
import ResultadoConsulta from "./pages/resultado";
import NotFound from "./pages/NotFound";
const Checkout = lazy(() => import("./pages/Checkout"));
const Admin = lazy(() => import("./pages/Admin"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
import swManager from '@/utils/swRegistration';
import performanceMonitor from '@/utils/performanceMonitor';
import { preloadCriticalImages } from '@/utils/performance';

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem forcedTheme={isAdmin ? undefined : 'light'}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
        <Route path="/resultado" element={<ResultadoConsulta />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

const App = () => {
  // Initialize performance systems
  useEffect(() => {
    // Start performance monitoring
    performanceMonitor.startTransaction('app_initialization')();

    // Register service worker
    swManager.register({
      enableBackgroundSync: true,
      onReady: () => console.log('✅ Service Worker ready'),
      onUpdate: () => console.log('🔄 App update available')
    });

    // Preload critical images
    preloadCriticalImages().catch(console.warn);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
