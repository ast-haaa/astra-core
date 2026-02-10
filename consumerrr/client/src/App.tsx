import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/roles/consumer/components/ui/toaster";
import { queryClient } from "@/roles/consumer/lib/queryClient";
import { LanguageProvider } from "@/roles/consumer/LanguageContext";

import ConsumerApp from "@/roles/consumer/ConsumerApp";
import FarmerApp from "@/roles/farmer/FarmerApp";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Toaster />

        <Switch>
          {/* Consumer */}
          <Route path="/" component={ConsumerApp} />

          {/* Farmer (NESTED) */}
         <Route path="/farmer/*" component={FarmerApp} />

          {/* Fallback */}
          <Route>
            <div className="p-10 text-center text-xl">
              404 | Page not found
            </div>
          </Route>
        </Switch>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
