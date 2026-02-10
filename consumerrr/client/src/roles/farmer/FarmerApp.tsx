import { Switch, Route } from "wouter";

import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import NotFound from "./pages/not-found";

export default function FarmerApp() {
  return (
    <Switch>
      using React Router but with wouter?
      {/* /farmer */}
      <Route path="/" component={AuthPage} />

      {/* /farmer/home */}
      <Route path="/home" component={HomePage} />

      {/* fallback inside farmer */}
      <Route component={NotFound} />
    </Switch>
  );
}
