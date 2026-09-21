import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminTeamView({ currentProfile }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, permissions');
      
    if (error) {
      console.error("Error al cargar equipo:", error);
    }
      
    // En una app real, también podríamos cruzar con auth.users para traer emails,
    // pero por seguridad de Supabase (auth.users no es accesible desde JS por defecto),
    // mostraremos el ID y el Rol. (Opcional: puedes guardar el email en 'profiles' usando un Trigger).
    
    if (!error && data) {
      setTeam(data);
    }
    setLoading(false);
  };

  const handleTogglePermission = async (userId, permKey, currentValue) => {
    const userToUpdate = team.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    const newPermissions = {
      ...(userToUpdate.permissions || {}),
      [permKey]: !currentValue
    };

    // Actualizamos estado local optimista
    setTeam(prev => prev.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u));

    // Guardar en DB
    const { error } = await supabase
      .from('profiles')
      .update({ permissions: newPermissions })
      .eq('id', userId);

    if (error) {
      console.error("Error updating permissions:", error);
      fetchTeam(); // revert si falla
      alert("Error al actualizar permisos");
    }
  };

  if (loading) return <div className="text-pink-500 animate-pulse font-bold text-center py-10">Cargando equipo...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-10 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-[1000] uppercase tracking-tighter mb-2 relative z-10 text-white">
          Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Equipo</span>
        </h2>
        <p className="text-zinc-500 text-xs font-medium max-w-lg relative z-10">
          Activa o desactiva las funciones que cada administrador puede usar dentro del panel.
        </p>

        <div className="mt-8 space-y-4">
          {team.map(member => {
            const isSelf = currentProfile?.id === member.id;
            const isSuper = member.role === 'superadmin';
            const perms = member.permissions || {};
            
            return (
              <div key={member.id} className={`bg-zinc-950 p-6 rounded-3xl border ${isSelf ? 'border-pink-500/30' : 'border-zinc-850'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white uppercase text-sm">
                        User ID: <span className="font-mono text-zinc-400">{member.id.split('-')[0]}...</span>
                      </h4>
                      {isSelf && <span className="bg-pink-500/20 text-pink-400 text-[10px] px-2 py-1 rounded-md font-black uppercase">Tú</span>}
                      {isSuper && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-1 rounded-md font-black uppercase">Superadmin</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/50">
                  <PermissionToggle 
                    label="Borrar Eventos" 
                    active={perms.can_delete_events} 
                    onChange={() => handleTogglePermission(member.id, 'can_delete_events', perms.can_delete_events)}
                    disabled={isSelf || isSuper}
                  />
                  <PermissionToggle 
                    label="Gestionar Organizadores" 
                    active={perms.can_manage_organizers} 
                    onChange={() => handleTogglePermission(member.id, 'can_manage_organizers', perms.can_manage_organizers)}
                    disabled={isSelf || isSuper}
                  />
                  <PermissionToggle 
                    label="Gestionar Equipo" 
                    active={perms.can_manage_team} 
                    onChange={() => handleTogglePermission(member.id, 'can_manage_team', perms.can_manage_team)}
                    disabled={isSelf || isSuper}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PermissionToggle({ label, active, onChange, disabled }) {
  return (
    <label className={`flex items-center justify-between p-4 rounded-xl border ${active ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-zinc-900/40 border-zinc-800'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-zinc-600 transition-colors'}`}>
      <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      <input 
        type="checkbox" 
        checked={active || false} 
        onChange={onChange}
        disabled={disabled}
        className="w-5 h-5 accent-cyan-500 bg-zinc-900 rounded"
      />
    </label>
  );
}
