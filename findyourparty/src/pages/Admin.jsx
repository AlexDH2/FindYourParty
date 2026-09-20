import { useContext, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { EventContext } from "../context/EventContext"
import { authService } from "../services/authService"
import { organizerService } from "../services/organizerService"
import { useReservationsHistory } from "../hooks/useReservationsHistory"
import { formatToYYYYMMDD } from "../utils/dateUtils"
import { VENUE_PRESETS } from "../constants/eventPresets"

// Componentes modulares
import FlyerGalleryUploader from "../components/admin/FlyerGalleryUploader"
import TicketManager from "../components/admin/TicketManager"
import AdminEventsList from "../components/admin/AdminEventsList"
import AdminReservations from "../components/admin/AdminReservations"
import BannerCropperModal from "../components/admin/BannerCropperModal"
import PartyDatePicker from "../components/admin/PartyDatePicker"

// Nuevas Vistas Modulares
import AdminDashboardView from "../components/admin/AdminDashboardView"
import AdminOrganizersView from "../components/admin/AdminOrganizersView"
import AdminReservationsView from "../components/admin/AdminReservationsView"

// Función auxiliar para autocompletar números de WhatsApp a formato wa.me
function formatWhatsAppLink(val) {
  if (!val) return null
  const trimmed = String(val).trim()
  if (!trimmed) return null

  // Si ya es un enlace completo, se conserva intacto
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  // Extrae solo los dígitos
  let clean = trimmed.replace(/\D/g, "")

  // Si es un celular peruano de 9 dígitos, antepone el código de país 51
  if (clean.length === 9 && clean.startsWith("9")) {
    clean = `51${clean}`
  }

  return clean ? `https://wa.me/${clean}` : null
}

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get("tab") || "eventos"

  const { events = [], reservations = [], addEvent, deleteEvent, updateEvent } = useContext(EventContext) || {}
  const { history, refetchHistory } = useReservationsHistory()

  // Jerarquía: 'superadmin' o 'admin'
  const [userRole, setUserRole] = useState("superadmin")
  const [organizers, setOrganizers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [newAdminRole, setNewAdminRole] = useState("admin")
  const [showCropper, setShowCropper] = useState(false)

  const [ticketTypes, setTicketTypes] = useState([])
  const [galleryImages, setGalleryImages] = useState([])
  const [testDate, setTestDate] = useState(formatToYYYYMMDD(new Date()))

  const initialFormState = {
    title: "",
    location: "",
    date: "",
    featured: false,
    image: "",
    banner_position: "50% 20%",
    banner_zoom: 1,
    maps: "",
    whatsapp: "",
    description: "",
    organizer_id: null,
    publication_status: "published",
    local_distribution_image: "",
    opening_time: "10:00 PM",
    dresscode: "Temático / Disfraces",
    min_age: "+18"
  }
  const [formData, setFormData] = useState(initialFormState)

  // Obtener rol del usuario conectado
  useEffect(() => {
    async function fetchRole() {
      try {
        const role = await authService.getCurrentUserRole()
        if (role) setUserRole(role)
      } catch (e) {
        console.error("Error cargando rol:", e)
      }
    }
    void fetchRole()
  }, [])

  const loadOrganizers = useCallback(async () => {
    try {
      const data = await organizerService.listOrganizers()
      setOrganizers(data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => { void loadOrganizers() }, [loadOrganizers])

  function handleChange(e) {
    const { name, type, checked, value } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function applyPresetVenue(key) {
    if (VENUE_PRESETS[key]) {
      setFormData(prev => ({ ...prev, ...VENUE_PRESETS[key] }))
    }
  }

  function handleEdit(event) {
    if (!event) return
    setEditingId(event.id)
    setFormData({
      title: event.title || "",
      location: event.location || "",
      date: formatToYYYYMMDD(event.date),
      featured: Boolean(event.featured),
      image: event.image || "",
      banner_position: event.banner_position || "50% 20%",
      banner_zoom: Number(event.banner_zoom) || 1,
      maps: event.maps || "",
      whatsapp: event.whatsapp || "",
      local_distribution_image: event.local_distribution_image || "",
      description: event.description || "",
      organizer_id: event.organizer_id || null,
      publication_status: event.publication_status || "published",
      opening_time: event.opening_time || "10:00 PM",
      dresscode: event.dresscode || "Temático / Disfraces",
      min_age: event.min_age || "+18"
    })

    setTicketTypes(Array.isArray(event.prices_json) ? event.prices_json : [])
    if (Array.isArray(event.gallery_images) && event.gallery_images.length > 0) {
      setGalleryImages(event.gallery_images)
    } else if (event.image) {
      setGalleryImages([{ url: event.image, label: "Portada" }])
    } else {
      setGalleryImages([])
    }

    setSearchParams({ tab: "eventos" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const portadaImg = galleryImages.find(i => i.label === "Portada") || galleryImages[0]
      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        date: formData.date,
        featured: Boolean(formData.featured),
        image: portadaImg?.url || formData.image || "",
        banner_position: formData.banner_position || "50% 20%",
        banner_zoom: Number(formData.banner_zoom) || 1,
        maps: formData.maps ? formData.maps.trim() : null,
        whatsapp: formatWhatsAppLink(formData.whatsapp),
        description: formData.description ? formData.description.trim() : "",
        organizer_id: formData.organizer_id ? formData.organizer_id : null,
        publication_status: formData.publication_status || "published",
        local_distribution_image: formData.local_distribution_image || null,
        opening_time: formData.opening_time || "10:00 PM",
        dresscode: formData.dresscode || "Temático / Disfraces",
        min_age: formData.min_age || "+18",
        prices_json: ticketTypes,
        gallery_images: galleryImages
      }

      if (editingId) {
        await updateEvent({ ...payload, id: editingId })
        setEditingId(null)
      } else {
        await addEvent(payload)
      }

      setFormData(initialFormState)
      setTicketTypes([])
      setGalleryImages([])
      alert("¡Evento guardado con éxito!")
    } catch (err) {
      console.error(err)
      alert("Error al guardar evento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegisterAdmin(e) {
    e.preventDefault()
    try {
      await authService.registerAdmin(newAdminEmail, newAdminPassword, newAdminRole)
      alert(`Usuario registrado exitosamente con rol: ${newAdminRole.toUpperCase()}`)
      setNewAdminEmail("")
      setNewAdminPassword("")
      setNewAdminRole("admin")
      setShowAdminModal(false)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const currentCoverImage = galleryImages.find(i => i.label === "Portada")?.url || galleryImages[0]?.url || formData.image
  const isSuperAdmin = userRole === "superadmin"

  return (
    <div className="space-y-6">
      
      {/* 1. VISTA DASHBOARD */}
      {currentTab === "dashboard" && (
        <AdminDashboardView
          events={events}
          reservations={reservations}
          onNavigateToTab={(tab) => setSearchParams({ tab })}
        />
      )}

      {/* 2. VISTA RESERVAS COMPLETA */}
      {currentTab === "reservas" && (
        <AdminReservationsView
          reservations={reservations}
          history={history}
          refetchHistory={refetchHistory}
        />
      )}

      {/* 3. VISTA ORGANIZADORES */}
      {currentTab === "organizadores" && (
        <AdminOrganizersView />
      )}

      {/* 4. VISTA EVENTOS (CREADOR Y CARTELERAS) */}
      {currentTab === "eventos" && (
        <>
          {/* Barra superior de acciones */}
          <div className="flex justify-between items-center mb-6 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-[1000] tracking-tight uppercase">
                  FYP <span className="text-pink-500">PANEL</span>
                </h2>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isSuperAdmin
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    : "bg-lime-500/20 text-lime-400 border-lime-500/30"
                }`}>
                  {isSuperAdmin ? "👑 SuperAdmin" : "🛡️ Admin"}
                </span>
              </div>
              <p className="text-xs text-zinc-500">Gestión y Publicación de Fiestas</p>
            </div>
            <div className="flex gap-2">
              {isSuperAdmin && (
                <button
                  onClick={() => setShowAdminModal(!showAdminModal)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  🛡️ Admin Users
                </button>
              )}
              <button
                onClick={async () => { await authService.logout(); window.location.href = "/login"; }}
                className="bg-zinc-950 border border-zinc-800 text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Modal para Crear Administrador (Solo visible para SuperAdmin) */}
          {showAdminModal && isSuperAdmin && (
            <form onSubmit={handleRegisterAdmin} className="mb-6 p-6 bg-zinc-900/90 border border-purple-500/30 rounded-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Email</label>
                <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} required placeholder="admin@findyourparty.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Contraseña</label>
                <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Rol a Asignar</label>
                <select
                  value={newAdminRole}
                  onChange={e => setNewAdminRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="admin">Admin (Gestión Eventos y Reservas)</option>
                  <option value="superadmin">SuperAdmin (Control Total)</option>
                </select>
              </div>
              <button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs uppercase py-3 rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all cursor-pointer">
                + Crear Usuario
              </button>
            </form>
          )}

          {showCropper && currentCoverImage && (
            <BannerCropperModal
              imageUrl={currentCoverImage}
              initialPosition={formData.banner_position}
              initialZoom={formData.banner_zoom}
              onSave={({ position, zoom }) => {
                setFormData(prev => ({ ...prev, banner_position: position, banner_zoom: zoom }))
              }}
              onClose={() => setShowCropper(false)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="bg-zinc-950/70 p-6 md:p-8 rounded-[2.5rem] border border-zinc-850 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-[1000] tracking-tight">
                    {editingId ? <span className="text-amber-400">📝 EDITANDO EVENTO</span> : <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-lime-400 bg-clip-text text-transparent">✨ PUBLICAR NUEVO EVENTO</span>}
                  </h2>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setFormData(initialFormState); setTicketTypes([]); setGalleryImages([]); }} className="text-xs text-zinc-500 hover:text-white uppercase font-bold">
                      Cancelar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Nombre</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Ej. LA SECTA" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm font-bold text-white outline-none" />
                  </div>
                  
                  {/* Selector de Fecha Mejorado (PartyDatePicker con Scroll de Rueda) */}
                  <div>
                    <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Fecha</label>
                    <PartyDatePicker
                      value={formData.date}
                      onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                      placeholder="Seleccionar fecha"
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-lime-400 uppercase">📍 Ubicación</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => applyPresetVenue("kan_kun")} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-[10px] font-bold">Kan Kun</button>
                      <button type="button" onClick={() => applyPresetVenue("green_arena")} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-[10px] font-bold">Green Arena</button>
                    </div>
                  </div>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Discoteca o Local" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="url" name="maps" value={formData.maps} onChange={handleChange} placeholder="Google Maps URL" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none" />
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      onBlur={(e) => {
                        if (e.target.value) {
                          const formatted = formatWhatsAppLink(e.target.value)
                          if (formatted) setFormData(prev => ({ ...prev, whatsapp: formatted }))
                        }
                      }}
                      placeholder="WhatsApp (ej: 941183428)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <FlyerGalleryUploader galleryImages={galleryImages} setGalleryImages={setGalleryImages} setFormData={setFormData} />

                {currentCoverImage && (
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-pink-400">✂️ Encuadre de Portada (WhatsApp)</p>
                      <p className="text-[10px] text-zinc-500">Posición: {formData.banner_position} | Zoom: {formData.banner_zoom}x</p>
                    </div>
                    <button type="button" onClick={() => setShowCropper(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl">
                      Ajustar Encuadre
                    </button>
                  </div>
                )}

                <TicketManager ticketTypes={ticketTypes} setTicketTypes={setTicketTypes} eventDate={formData.date} testDate={testDate} setTestDate={setTestDate} />

                <div className="space-y-3">
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Descripción del evento" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Dresscode</label>
                      <input type="text" name="dresscode" value={formData.dresscode} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Edad Mínima</label>
                      <input type="text" name="min_age" value={formData.min_age} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Hora</label>
                      <input type="text" name="opening_time" value={formData.opening_time} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <select name="organizer_id" value={formData.organizer_id || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none">
                      <option value="">-- Sin Organizador --</option>
                      {organizers.map(org => (<option key={org.id} value={org.id}>{org.name}</option>))}
                    </select>

                    <select name="publication_status" value={formData.publication_status} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none">
                      <option value="published">Publicado</option>
                      <option value="draft">Borrador</option>
                      <option value="hidden">Oculto</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <input type="checkbox" name="featured" id="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 accent-pink-500 rounded" />
                    <label htmlFor="featured" className="text-xs font-bold text-zinc-300 cursor-pointer">⭐ Destacar en el Hero principal</label>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full font-black uppercase tracking-widest p-4 rounded-2xl text-sm bg-gradient-to-r from-pink-500 via-purple-500 to-lime-400 text-black cursor-pointer">
                  {isSubmitting ? "Guardando..." : editingId ? "💾 Actualizar Evento" : "🚀 Publicar Evento Line-Up"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <AdminEventsList
                events={events}
                search={search}
                setSearch={setSearch}
                onEdit={handleEdit}
                onDelete={isSuperAdmin ? deleteEvent : () => alert("Solo el SuperAdmin tiene permisos para eliminar eventos.")}
              />
              <AdminReservations reservations={reservations} history={history} refetchHistory={refetchHistory} />
            </div>
          </div>
        </>
      )}

    </div>
  )
}