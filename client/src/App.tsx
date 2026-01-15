import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/LanguageProvider";
import { OnboardingTour } from "@/components/OnboardingTour";
import NotFound from "@/pages/not-found";
import Home from "./pages/home";
import Timeline from "./pages/timeline";
import Profile from "./pages/profile";
import SymptomsPage from "./pages/symptoms";
import SharePage from "./pages/share";
import SharedSummaryPage from "./pages/shared-summary";
import MessagesPage from "./pages/messages";
import ForumPage from "./pages/forum";
import SupplementsPage from "./pages/supplements";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/profile" component={Profile} />
      <Route path="/symptoms" component={SymptomsPage} />
      <Route path="/share" component={SharePage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/supplements" component={SupplementsPage} />
      <Route path="/shared/:token" component={SharedSummaryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <OnboardingTour />
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
