import { Outlet } from "react-router-dom";
import { Navigation } from "./navigation";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
