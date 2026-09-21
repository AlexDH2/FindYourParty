import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        setProfile({
          ...data,
          email: session.user.email,
          permissions: data.permissions || {
            can_delete_events: false,
            can_manage_organizers: false,
            can_manage_team: false
          }
        });
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isSuperadmin = profile?.role === 'superadmin';
  
  const canDeleteEvents = isSuperadmin || profile?.permissions?.can_delete_events;
  const canManageOrganizers = isSuperadmin || profile?.permissions?.can_manage_organizers;
  const canManageTeam = isSuperadmin || profile?.permissions?.can_manage_team;

  return { profile, loading, isSuperadmin, canDeleteEvents, canManageOrganizers, canManageTeam, refetchProfile: fetchProfile };
}
