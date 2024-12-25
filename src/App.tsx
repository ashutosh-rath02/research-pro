import React, { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { PDFViewer } from "./components/PDFViewer";
import { NotesPanel } from "./components/NotesPanel";
import { MindMap } from "./components/MindMap";
import { AuthForm } from "./components/auth/AuthForm";
import { CollapsiblePanel } from "./components/layout/CollapsiblePanel";
import { Header } from "./components/layout/Header";
import { TabNavigation } from "./components/layout/TabNavigation";
import { supabase } from "./lib/supabase";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "mindmap">("notes");

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
    <div className="min-h-screen bg-gray-100">
      <Header onSignOut={() => supabase.auth.signOut()} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          <PDFViewer />
          <CollapsiblePanel>
            <div className="h-full bg-white rounded-lg shadow-sm">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="h-[calc(100%-3rem)]">
                {activeTab === "notes" ? <NotesPanel /> : <MindMap />}
              </div>
            </div>
          </CollapsiblePanel>
        </div>
      </main>
    </div>
  );
};

export default App;
