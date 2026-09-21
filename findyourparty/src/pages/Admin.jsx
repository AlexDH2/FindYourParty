import { useContext, useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { EventContext } from "../context/EventContext"
import { authService } from "../services/authService"
import { organizerService } from "../services/organizerService"
import { useReservationsHistory } from "../hooks/useReservationsHistory"
import { formatToYYYYMMDD } from "../utils/dateUtils"
import { parseNewPricesJsonString } from "../utils/priceUtils"
import { VENUE_PRESETS } from "../constants/eventPresets"
import { useAdminProfile } from "../hooks/useAdminProfile"

// Componentes modulares
import FlyerGalleryUploader from "../components/admin/FlyerGalleryUploader"
import TicketManager from "../components/admin/TicketManager"
import AdminEventsList from "../components/admin/AdminEventsList"
import AdminReservations from "../components/admin/AdminReservations"
import BannerCropperModal from "../components/admin/BannerCropperModal"

// Nuevas Vistas Modulares
import AdminDashboardView from "../components/admin/AdminDashboardView"
import AdminOrganizersView from "../components/admin/AdminOrganizersView"
import AdminReservationsView from "../components/admin/AdminReservationsView"

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentTab = searchParams.get("tab") || "eventos"

  const { canDeleteEvents, isSuperadmin } = useAdminProfile()

  const { events = [], reservations = [], addEvent, deleteEvent, updateEvent } = useContext(EventContext) || {}
  const { history, refetchHistory } = useReservationsHistory()

  const [organizers, setOrganizers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPromo, setIsUploadingPromo] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
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
    min_age: "+18",
    promo_active: false,
    promo_image_url: "",
    promo_expires_at: ""
  }
  const [formData, setFormData] = useState(initialFormState)

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
    setSearchParams({ tab: "nuevo-evento" })
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
      min_age: event.min_age || "+18",
      promo_active: Boolean(event.promo_active),
      promo_image_url: event.promo_image_url || "",
      promo_expires_at: event.promo_expires_at ? new Date(event.promo_expires_at).toISOString().slice(0, 16) : ""
    })

    setTicketTypes(parseNewPricesJsonString(event.prices_json))
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

  function handleDuplicate(event) {
    if (!event) return
    setEditingId(null)
    setSearchParams({ tab: "nuevo-evento" })
    setFormData({
      title: `Copia de ${event.title || ""}`,
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
      publication_status: "draft",
      opening_time: event.opening_time || "10:00 PM",
      dresscode: event.dresscode || "Temático / Disfraces",
      min_age: event.min_age || "+18"
    })
    setTicketTypes(parseNewPricesJsonString(event.prices_json))
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

  const handlePromoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPromo(true);
      const { compressImage } = await import("../utils/imageCompression");
      const { storageService } = await import("../services/storageService");
      const compressed = await compressImage(file, { isMap: false });
      const ext = compressed.name.split(".").pop() || "webp";
      const fileName = `promo-${Date.now()}.${ext}`;
      await storageService.uploadImage({ bucket: "event-images", fileName, file: compressed });
      const url = storageService.getPublicUrl({ bucket: "event-images", fileName });
      setFormData(prev => ({ ...prev, promo_image_url: url }));
    } catch (err) {
      console.error(err);
      alert("Error al subir imagen promocional.");
    } finally {
      setIsUploadingPromo(false);
      e.target.value = "";
    }
  };

  async function handleSubmit(e) {
    e.preventDefault()
    if (ticketTypes.length === 0) return alert('Debe agregar al menos un ticket')
    if (galleryImages.length === 0) return alert('Debe subir al menos una imagen')
    if (!formData.whatsapp) return alert('El WhatsApp es obligatorio')
    
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
        whatsapp: formData.whatsapp ? formData.whatsapp.trim() : null,
        description: formData.description ? formData.description.trim() : "",
        organizer_id: formData.organizer_id ? formData.organizer_id : null,
        publication_status: formData.publication_status || "published",
        local_distribution_image: formData.local_distribution_image || null,
        opening_time: formData.opening_time || "10:00 PM",
        dresscode: formData.dresscode || "Temático / Disfraces",
        min_age: formData.min_age || "+18",
        promo_active: Boolean(formData.promo_active),
        promo_image_url: formData.promo_image_url || null,
        promo_expires_at: formData.promo_expires_at ? new Date(formData.promo_expires_at).toISOString() : null,
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
      await authService.registerAdmin(newAdminEmail, newAdminPassword)
      alert("Administrador creado exitosamente.")
      setNewAdminEmail("")
      setNewAdminPassword("")
      setShowAdminModal(false)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const currentCoverImage = galleryImages.find(i => i.label === "Portada")?.url || galleryImages[0]?.url || formData.image

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
              <h2 className="text-xl font-[1000] tracking-tight uppercase">
                FYP <span className="text-pink-500">PANEL</span>
              </h2>
              <p className="text-xs text-zinc-500">Gestión y Publicación de Fiestas</p>
            </div>
            <div className="flex gap-2">
              {isSuperadmin && (
                <button
                  onClick={() => setShowAdminModal(!showAdminModal)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold uppercase"
                >
                  👑 Admin Users
                </button>
              )}
              <button
                onClick={async () => { await authService.logout(); navigate("/login"); }}
                className="bg-zinc-950 border border-zinc-800 text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {showAdminModal && (
            <form onSubmit={handleRegisterAdmin} className="mb-6 p-6 bg-zinc-900/90 border border-purple-500/30 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Email</label>
                <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Contraseña</label>
                <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none" />
              </div>
              <button type="submit" className="bg-purple-600 text-white font-black text-xs uppercase py-3 rounded-xl">+ Crear Admin</button>
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

          
          <div className="max-w-4xl mx-auto space-y-6">
            <AdminEventsList events={events} search={search} setSearch={setSearch} onEdit={handleEdit} onDelete={deleteEvent} onDuplicate={handleDuplicate} canDeleteEvents={canDeleteEvents} />
          </div>
        </>
      )}

      {/* VISTA NUEVO EVENTO (FORMULARIO) */}
      {currentTab === "nuevo-evento" && (
        <div className="max-w-4xl mx-auto">
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

                <details className="group bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850" open>
                  <summary className="text-sm font-black uppercase text-white cursor-pointer select-none">Datos Básicos</summary>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Nombre</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Ej. LA SECTA" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm font-bold text-white outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Fecha</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none [color-scheme:dark]" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
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
                        <div>
                          <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">WhatsApp (número con código país)</label>
                          <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="51987654321" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none" />
                        </div>
                      </div>
                    </div>

                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Descripción del evento" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" />
                  </div>
                </details>

                <details className="group bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850">
                  <summary className="text-sm font-black uppercase text-white cursor-pointer select-none">Imágenes</summary>
                  <div className="mt-4 space-y-4">
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
                  </div>
                </details>

                <details className="group bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850">
                  <summary className="text-sm font-black uppercase text-white cursor-pointer select-none">Entradas</summary>
                  <div className="mt-4">
                    <TicketManager ticketTypes={ticketTypes} setTicketTypes={setTicketTypes} eventDate={formData.date} testDate={testDate} setTestDate={setTestDate} />
                  </div>
                </details>

                <details className="group bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850">
                  <summary className="text-sm font-black uppercase text-white cursor-pointer select-none">Configuración</summary>
                  <div className="mt-4 space-y-3">
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
                </details>

                {/* PROMOCIÓN ESPECIAL */}
                <details className="group bg-zinc-900/50 p-4 rounded-2xl border border-pink-500/30">
                  <summary className="text-sm font-black uppercase text-pink-400 cursor-pointer select-none">🎟️ Promoción Especial (Banner)</summary>
                  <div className="mt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <input 
                        type="checkbox" 
                        name="promo_active" 
                        checked={formData.promo_active} 
                        onChange={(e) => setFormData({...formData, promo_active: e.target.checked})} 
                        className="w-5 h-5 accent-pink-500 rounded bg-zinc-900"
                      />
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Activar Banner Promocional</span>
                    </label>

                    {formData.promo_active && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <div>
                          <label className="text-[10px] font-black text-pink-400 uppercase block mb-1">Imagen Promocional</label>
                          {formData.promo_image_url ? (
                            <div className="relative rounded-xl overflow-hidden group">
                              <img src={formData.promo_image_url} alt="Promo" className="w-full h-32 object-cover border border-zinc-800" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-lg">
                                  {isUploadingPromo ? 'Subiendo...' : 'Cambiar Imagen'}
                                  <input type="file" accept="image/*" onChange={handlePromoUpload} className="hidden" disabled={isUploadingPromo} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-zinc-800 hover:border-pink-500/50 h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/60">
                              <span className="text-xl mb-1">📸</span>
                              <span className="text-[10px] font-bold text-zinc-400">
                                {isUploadingPromo ? 'Subiendo imagen...' : 'Clic para subir el flyer de la promo'}
                              </span>
                              <input type="file" accept="image/*" onChange={handlePromoUpload} className="hidden" disabled={isUploadingPromo} />
                            </label>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-pink-400 uppercase block mb-1">Fecha y Hora de Expiración</label>
                          <input 
                            type="datetime-local" 
                            name="promo_expires_at" 
                            value={formData.promo_expires_at} 
                            onChange={handleChange} 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none [color-scheme:dark]" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </details>

                <button type="submit" disabled={isSubmitting} className="w-full font-black uppercase tracking-widest p-4 rounded-2xl text-sm bg-gradient-to-r from-pink-500 via-purple-500 to-lime-400 text-black">
                  {isSubmitting ? "Guardando..." : editingId ? "💾 Actualizar Evento" : "🚀 Publicar Evento Line-Up"}
                </button>
              </form>
        </div>
      )}
    </div>
  )
}
