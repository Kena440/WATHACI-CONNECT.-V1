import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";
import { SignIn } from "./pages/SignIn";
import { GetStarted } from "./pages/GetStarted";
import { SubscriptionPlans } from "./pages/SubscriptionPlans";
import { PartnershipHub } from "./pages/PartnershipHub";
import FundingHub from "./pages/FundingHub";
import { ProfileSetup } from "./pages/ProfileSetup";
import { ProfileReview } from "./components/ProfileReview";
import FreelancerHub from "./pages/FreelancerHub";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Messages from "./pages/Messages";
import AboutUs from "./pages/AboutUs";
import { PrivateRoute } from "./components/PrivateRoute";

const queryClient = new QueryClient();

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/marketplace" element={<Marketplace />} />
    <Route path="/freelancer-hub" element={<FreelancerHub />} />
    <Route path="/resources" element={<Resources />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/get-started" element={<GetStarted />} />
    <Route path="/profile-setup" element={<ProfileSetup />} />
    <Route path="/profile-review" element={<ProfileReview />} />
    <Route path="/subscription-plans" element={<SubscriptionPlans />} />
    <Route path="/partnership-hub" element={<PartnershipHub />} />
    <Route
      path="/funding-hub"
      element={
        <PrivateRoute>
          <FundingHub />
        </PrivateRoute>
      }
    />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/about-us" element={<AboutUs />} />
    <Route
      path="/messages"
      element={
        <PrivateRoute>
          <Messages />
        </PrivateRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;