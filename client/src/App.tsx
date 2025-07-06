import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { NavigationProvider } from "@/contexts/NavigationContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Portfolio from "@/pages/Portfolio";
import StockAnalysis from "@/pages/StockAnalysis";
import MarketWeather from "@/pages/MarketWeather";
import DartDisclosures from "@/pages/DartDisclosures";
import Settings from "@/pages/Settings";
import Layout from "@/components/Layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={MarketWeather} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/analysis" component={StockAnalysis} />
          <Route path="/dart" component={DartDisclosures} />
          <Route path="/settings" component={Settings} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NavigationProvider>
          <Toaster />
          <Router />
        </NavigationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
