// src/routes/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (error || !profile) {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }
      const role = profile.role;
      if (role !== "admin" && role !== "superadmin") {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }
      setChecking(false);
    }
    verify();
  }, [navigate]);

  if (checking) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
