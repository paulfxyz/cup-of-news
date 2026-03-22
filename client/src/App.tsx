import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";
import { AdminAuthGate } from "./components/AdminAuth";
import DigestView from "./pages/DigestView";
import AdminPage from "./pages/AdminPage";
import SetupPage from "./pages/SetupPage";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/" component={DigestView} />
            <Route path="/admin" component={() => (
              <AdminAuthGate>
                <AdminPage />
              </AdminAuthGate>
            )} />
            <Route path="/setup" component={SetupPage} />
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
