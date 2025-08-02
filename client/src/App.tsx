import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Timeline from "./pages/timeline";
import Profile from "./pages/profile";
import AuthPage from "./pages/auth";
import SymptomsPage from "./pages/symptoms";
import SharePage from "./pages/share";
import SharedSummaryPage from "./pages/shared-summary";
import MessagesPage from "./pages/messages";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/profile" component={Profile} />
          <Route path="/symptoms" component={SymptomsPage} />
          <Route path="/share" component={SharePage} />
          <Route path="/messages" component={MessagesPage} />
        </>
      )}
      {/* Public routes (no auth required) */}
      <Route path="/shared/:token" component={SharedSummaryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
