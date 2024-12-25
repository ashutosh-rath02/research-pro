import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { AuthForm } from "./components/auth/AuthForm";
import { MainLayout } from "./components/layout/MainLayout";
import { WorkspacePage } from "./pages/WorkspacePage";
import { ProjectsPage } from "./pages/ProjectsPage";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <AuthForm />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<WorkspacePage />} />
          <Route path="projects" element={<ProjectsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
