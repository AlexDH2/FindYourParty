import { useContext, useState, useEffect, useCallback } from "react"
import { EventContext } from "../context/EventContext"
import { supabase } from "../lib/supabase"
import { storageService } from "../services/storageService"
import { authService } from "../services/authService" // Import authService
import { useReservationsHistory } from "../hooks/useReservationsHistory"
import { organizerService } from "../services/organizerService"
import { slugify } from "../utils/slugify" // Import slugify
import { parseNewPricesJsonString, getActiveTicketStageAndPrice } from "../utils/priceUtils"
import { formatToYYYYMMDD, parseYYYYMMDDToLocalDate } from "../utils/dateUtils"

export default function Admin() {
  const {
    events = [],
    reservations = [],
    addEvent,
    deleteEvent,
    updateEvent
  } = useContext(EventContext) || {}
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState("");

  async function handleLogout() {
    await authService.logout()
    window.location.href = "/login"
  }

  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState("")
  const [reservationView, setReservationView] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({}); // Nuevo estado para errores de validación
  const [organizerForm, setOrganizerForm] = useState({ id: null, name: "", logo_url: "", banner_url: "", description: "", social_media: {} });

  // 🚀 NUEVOS ESTADOS PARA EL HISTORIAL DE COMPRAS/RESERVAS RESPALDADAS
  const { history, loadingHistory, refetchHistory } = useReservationsHistory()

  // Estados para manejar los tipos de entrada y etapas
  const [ticketTypes, setTicketTypes] = useState([])
  const [testDate, setTestDate] = useState(formatToYYYYMMDD(new Date())) // Fecha de prueba para el Admin

  // Nuevos estados para el registro de administradores
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  
  const initialFormState = {
    title: "",
    location: "",
    date: "", // Event date
    // price: "", // REMOVED: now derived from prices_json
    // tickets_sold: 0, // REMOVED: now derived from reservations
    featured: false,
    image: "",
    maps: "",
    whatsapp: "",
    description: "", // Nuevo campo
    organizer_id: null, // Nuevo campo para FK a organizers
    publication_status: "draft", // Nuevo campo
    local_distribution_image: "",
    opening_time: "",
    dresscode: "", // Añadido a initialFormState para evitar "uncontrolled to controlled" warning
    min_age: "",   // Añadido a initialFormState para evitar "uncontrolled to controlled" warning
    prices_json: [], // Initialize as empty array for new structure
  }
  const [formData, setFormData] = useState(initialFormState)
  // INPUTS HANDLER
  function handleChange(e) {
    const { name, type, checked, value } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })

    if (name === "organizer_id") {
      setSelectedOrganizerId(value);
    }

    // Si el título cambia, el slug se regenerará al guardar
  }

  // Calcular las clases del botón de envío fuera del JSX para evitar errores de parsing
  const submitButtonClasses = `w-full font-black uppercase tracking-widest p-4 rounded-xl transition-all duration-300 text-xs shadow-lg ${editingId ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-amber-500/10' : 'bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-pink-500/20'} disabled:opacity-50`;


  // CREAR O EDITAR EVENTO
  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Validate stages before submitting
      const { isValid, errors } = validateStages(ticketTypes);
      if (!isValid) {
        setValidationErrors(errors); // Establecer los errores de validación
        alert("Por favor, corrige los errores en los precios y etapas.");
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        await updateEvent({ ...formData, id: editingId, prices_json: ticketTypes }) // Pass ticketTypes
        setEditingId(null)
      } else {
        await addEvent({ ...formData, prices_json: ticketTypes }) // Pass ticketTypes
      }
      setFormData(initialFormState)
      setValidationErrors({}); // Limpiar errores al enviar con éxito
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // SELECCIONAR PARA EDITAR
  function handleEdit(event) {
    if (!event) return
    setEditingId(event.id)
    setFormData({
      title: event.title || "",
      location: event.location || "",
      date: formatToYYYYMMDD(event.date),
      // price: event.price || "", // REMOVED
      // tickets_sold: event.tickets_sold || 0, // REMOVED
      featured: event.featured || false,
      image: event.image || "",
      maps: event.maps || "",
      whatsapp: event.whatsapp || "",
      local_distribution_image: event.local_distribution_image || "",
      description: event.description || "", // New field
      // organizer: event.organizer || "", // REMOVED: Replaced by organizer_id
      organizer_id: event.organizer_id || null, // New field
      publication_status: event.publication_status || "draft", // New field
      opening_time: event.opening_time || "", // New field
      dresscode: event.dresscode || "", // New field
      min_age: event.min_age || "", // New field
    })
    setValidationErrors({}); // Limpiar errores al editar
    // Normalizar prices_json para asegurar que todos los campos anidados estén definidos para los inputs controlados
    setTicketTypes(
      (event.prices_json || []).map(ticketType => ({
        ...ticketType,
        name: ticketType.name ?? "",
        description: ticketType.description ?? "",
        features: ticketType.features ?? [], // Asegurar que features es un array
        stages: (ticketType.stages || []).map(stage => ({
          ...stage,
          name: stage.name ?? "",
          price: stage.price ?? "", // Price puede ser 0 o un número, pero el input espera string
          start_date: stage.start_date ?? "",
          end_date: stage.end_date ?? "",
        }))
      }))
    );
  }

  // --- Lógica para gestionar tipos de entrada y etapas ---

  // Añadir un nuevo tipo de entrada
  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { id: Date.now(), name: "", description: "", features: [], stages: [] }]);
  };

  // Eliminar un tipo de entrada
  const removeTicketType = (id) => {
    setTicketTypes(ticketTypes.filter((type) => type.id !== id));
    setValidationErrors((prev) => { const newErrors = { ...prev }; delete newErrors[`ticketType-${id}-name`]; return newErrors; });
  };

  // Actualizar el nombre de un tipo de entrada
  const handleTicketTypeNameChange = (id, newName) => {
    setTicketTypes(
      ticketTypes.map((type) => (type.id === id ? { ...type, name: newName, slug: slugify(newName) } : type))
    );
  };

  const handleTicketTypeFieldChange = (id, field, value) => {
    setTicketTypes(
      ticketTypes.map((type) => (type.id === id ? { ...type, [field]: value } : type))
    );
  };

  // Añadir una nueva etapa a un tipo de entrada
  const addStage = (ticketTypeId) => {
    setTicketTypes(
      ticketTypes.map((type) =>
        type.id === ticketTypeId
          ? {
              ...type,
              stages: [
                ...type.stages,
                {
                  id: Date.now(),
                  name: "",
                  price: "",
                  start_date: "",
                  end_date: "",
                },
              ],
            }
          : type
      )
    );
  };

  // Eliminar una etapa de un tipo de entrada
  const removeStage = (ticketTypeId, stageId) => {
    setTicketTypes(
      ticketTypes.map((type) =>
        type.id === ticketTypeId
          ? { ...type, stages: type.stages.filter((stage) => stage.id !== stageId) }
          : type
      )
    );
    setValidationErrors((prev) => { const newErrors = { ...prev }; delete newErrors[`stage-${stageId}-name`]; delete newErrors[`stage-${stageId}-price`]; delete newErrors[`stage-${stageId}-start_date`]; delete newErrors[`stage-${stageId}-end_date`]; delete newErrors[`stage-${stageId}-dates`]; delete newErrors[`stage-${stageId}-overlap`]; return newErrors; });
  };

  // Manejar cambios en los campos de una etapa
  const handleStageChange = (ticketTypeId, stageId, field, value) => {
    setTicketTypes(
      ticketTypes.map((type) =>
        type.id === ticketTypeId
          ? {
              ...type,
              stages: type.stages.map((stage) =>
                stage.id === stageId ? { ...stage, [field]: value } : stage
              ),
            }
          : type
      )
    );
  };

  // Validaciones de fechas y superposición
  const validateStages = (currentTicketTypes) => {
    let isValid = true;
    const errors = {};

    currentTicketTypes.forEach((ticketType) => {
      if (!ticketType.name.trim()) {
        errors[`ticketType-${ticketType.id}-name`] = "El nombre del tipo de entrada es obligatorio.";
        isValid = false;
      }

      // Sort stages by start_date for easier validation
      // Usar parseYYYYMMDDToLocalDate para una comparación consistente y robusta
      const sortedStages = [...ticketType.stages].sort((a, b) => {
        return (parseYYYYMMDDToLocalDate(a.start_date)?.getTime() || -Infinity) - (parseYYYYMMDDToLocalDate(b.start_date)?.getTime() || -Infinity);
      });

      for (let i = 0; i < sortedStages.length; i++) {
        const stage = sortedStages[i];
        if (!stage.name.trim()) {
          errors[`stage-${stage.id}-name`] = "El nombre de la etapa es obligatorio.";
          isValid = false;
        }
        if (stage.price === "" || isNaN(Number(stage.price)) || Number(stage.price) < 0) {
          errors[`stage-${stage.id}-price`] = "El precio es obligatorio y debe ser un número positivo.";
          isValid = false;
        }
        if (!stage.start_date) {
          errors[`stage-${stage.id}-start_date`] = "La fecha de inicio es obligatoria.";
          isValid = false;
        }
        if (!stage.end_date) {
          errors[`stage-${stage.id}-end_date`] = "La fecha de fin es obligatoria.";
          isValid = false;
        }

        const parsedStartDate = parseYYYYMMDDToLocalDate(stage.start_date);
        const parsedEndDate = parseYYYYMMDDToLocalDate(stage.end_date);

        if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
          errors[`stage-${stage.id}-dates`] = "La fecha de fin no puede ser anterior a la de inicio.";
          isValid = false; // Mover esta asignación aquí para que siempre se establezca si hay error
        }

        // Check for overlapping dates within the same ticket type
        if (i > 0) {
          const prevStage = sortedStages[i - 1];
          if (prevStage.end_date && stage.start_date && new Date(stage.start_date) <= new Date(prevStage.end_date)) {
            errors[`stage-${stage.id}-overlap`] = `Las fechas de esta etapa se superponen con la etapa "${prevStage.name}".`;
            // Usar parseYYYYMMDDToLocalDate para la verificación de solapamiento
            const prevParsedEndDate = parseYYYYMMDDToLocalDate(prevStage.end_date);
            const currentParsedStartDate = parseYYYYMMDDToLocalDate(stage.start_date);
            if (prevParsedEndDate && currentParsedStartDate && currentParsedStartDate <= prevParsedEndDate) { isValid = false; }
          }
        }
      }
    });
    return { isValid, errors };
  };

  // Función para obtener el estado de una etapa (ACTIVA, FUTURA, FINALIZADA)
  const getStageStatus = (stage, currentTestDate) => {
    // Usar parseYYYYMMDDToLocalDate para asegurar consistencia en la zona horaria
    const today = parseYYYYMMDDToLocalDate(currentTestDate);
    const startDate = parseYYYYMMDDToLocalDate(stage.start_date);
    const endDate = parseYYYYMMDDToLocalDate(stage.end_date);

    // Si alguna de las fechas no es válida, no podemos determinar un estado significativo.
    // Podríamos devolver un estado "Inválida" o "Desconocida".
    if (!today || !startDate || !endDate) {
      return { status: "INVÁLIDA", color: "text-gray-500" };
    }

    // Set time to end of day for endDate to include the whole day
    endDate.setHours(23, 59, 59, 999);

    if (today >= startDate && today <= endDate) {
      return { status: "ACTIVA", color: "text-lime-400" };
    } else if (today < startDate) {
      return { status: "FUTURA", color: "text-blue-400" };
    } else {
      return { status: "FINALIZADA", color: "text-red-400" };
    }
  }

  // Función para registrar un nuevo administrador
  async function handleRegisterNewAdmin(e) {
    e.preventDefault();
    setIsSubmitting(true); // Reutilizamos isSubmitting para este formulario también
    try {
      await authService.registerAdmin(newAdminEmail, newAdminPassword);
      alert(`Administrador ${newAdminEmail} registrado con éxito.`);
      setNewAdminEmail("");
      setNewAdminPassword("");
    } catch (error) {
      alert(`Error al registrar administrador: ${error.message}`);
      console.error("Error al registrar administrador:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  // FILTRADO SEGURO
  const safeEvents = Array.isArray(events) ? events : []
  const safeReservations = Array.isArray(reservations) ? reservations : []

  // AGRUPAR RESERVAS POR EVENTO
  // (This logic was already present and is kept as is)
  const reservationsByEvent = safeEvents.map((event) => {
    if (!event) return { reservations: [] }
    const eventReservations = safeReservations.filter(
      (res) => res?.event_id === event?.id
    )
    return {
      ...event,
      reservations: eventReservations
    }
  })

  // SUBIR FLYER PRINCIPAL
  // Lógica movida a storageService.js
  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const fileName = `${Date.now()}-${file.name}`
    try {
      await storageService.uploadImage({
        bucket: "event-images", // Asegúrate de que este bucket exista en Supabase Storage
        fileName,
        file,
      })
      const publicUrl = storageService.getPublicUrl({
        bucket: "event-images",
        fileName,
      })

      setFormData((prev) => ({
        ...prev,
        image: publicUrl,
      }))
    } catch (error) {
      console.error("Error subiendo imagen:", error)
      alert("No se pudo subir la imagen")
    }
  }

  // SUBIR IMAGEN CROQUIS/DISTRIBUCIÓN LOCAL
  // Lógica movida a storageService.js
  async function handleDistributionUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const fileName = `${Date.now()}-dist-${file.name}`
    try {
      await storageService.uploadImage({ bucket: "event-images", fileName, file, })
      const publicUrl = storageService.getPublicUrl({ bucket: "event-images", fileName, }) // Asegúrate de que este bucket exista en Supabase Storage
      setFormData((prev) => ({ ...prev, local_distribution_image: publicUrl, }))
    } catch (error) {
      console.error("Error subiendo distribución:", error)
      alert("No se pudo subir la imagen de distribución")
    }
  }
  // Actualizar formData con ticketTypes antes de enviar
  useEffect(() => {
    // Este efecto debe actualizar principalmente prices_json y organizer_id
    // cuando sus estados de origen cambian. dresscode y min_age se manejan
    // directamente por handleChange.
    setFormData(prev => ({
      ...prev,
      prices_json: ticketTypes,
      organizer_id: selectedOrganizerId,
    }));
  }, [ticketTypes, selectedOrganizerId]); // Ahora solo depende de ticketTypes y selectedOrganizerId

  useEffect(() => {
    void loadOrganizers();
  }, []);

  const loadOrganizers = useCallback(async () => {
    try {
      const data = await organizerService.listOrganizers();
      setOrganizers(data);
    } catch (error) {
      console.error("Error loading organizers:", error);
    }
  }, []);

  // FILTRAR EVENTOS POR BÚSQUEDA
  const filteredEvents = safeEvents.filter((event) =>
    event?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#030303] text-white p-4 md:p-8 font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
      
      {/* Luces de fondo de neón (Efecto atmósfera de discoteca) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-pink-900/10 rounded-full blur-[180px] pointer-events-none" />

      {/* HEADER */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center mb-12 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent uppercase">
              FYP <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-lime-400">PANEL</span>
            </h1>
            <span className="bg-lime-400/10 border border-lime-400/30 text-lime-400 text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full animate-pulse">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-2 font-medium">
            Encuentra tu plan • Reserva • Disfruta — Control Maestro de Accesos
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full md:w-auto bg-zinc-950 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 border border-zinc-800 hover:border-red-900/30 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-inner"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <div className={`relative p-[1px] rounded-[2rem] transition-all duration-500 bg-gradient-to-b ${editingId ? 'from-amber-400 via-orange-500 to-zinc-900' : 'from-pink-500 via-purple-600 to-zinc-900'}`}>
          <div className="bg-[#09090b] p-6 md:p-8 rounded-[1.95rem] h-full">
            <h2 className="text-2xl font-[900] mb-6 flex items-center gap-2.5 tracking-tight">
              {editingId ? (
                <span className="text-amber-400">📝 EDITAR EVENTO</span>
              ) : (
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-lime-400 bg-clip-text text-transparent">✨ CREAR EVENTO</span>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Título del Evento</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ej. Golden Party v2"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none transition-all duration-300 text-white placeholder:text-zinc-600 font-medium focus:border-pink-500/50"
                />
              </div>

              {/* Ubicación - Ahora ocupa todo el ancho */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Ubicación</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Discoteca / Local"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none text-white focus:border-purple-500/50"
                />
              </div>

              {/* Fecha - Ahora ocupa todo el ancho */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Fecha</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 pl-9 text-sm outline-none text-zinc-400 cursor-pointer"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25m0 0v2.25m0-2.25h-3.375c-.621 0-1.125.504-1.125 1.125v3.5c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.5c0-.621-.504-1.125-1.125-1.125H6.75zM12 7.5h.008v.008H12V7.5zm0 2.25h.008v.008H12V9.75zm0 2.25h.008v.008H12v-2.25zM12 14.25h.008v.008H12v-2.25zM12 16.5h.008v.008H12v-2.25zM12 18.75h.008v.008H12v-2.25z" /> {/* Icono de calendario */}
                  </svg>
                </div>
              </div>

              {/* 🎟️ PRECIOS Y ETAPAS DE VENTA */}
              <div className="border-t border-zinc-900 pt-4 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight text-purple-400">🎟️ Precios y Etapas de Venta</h3>

                {/* Fecha de Prueba */}
                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5 uppercase tracking-widest">Fecha de Prueba (Admin)</label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none text-white"
                  />
                </div>

                {ticketTypes.map((ticketType) => (
                  <div key={ticketType.id} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-850 space-y-4">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        placeholder="Nombre del Tipo de Entrada (Ej: General, VIP)"
                        value={ticketType.name ?? ""}
                        onChange={(e) => handleTicketTypeNameChange(ticketType.id, e.target.value)}
                        className="bg-transparent text-lg font-black uppercase tracking-tight text-white outline-none border-b border-zinc-700 focus:border-purple-500 w-full"
                      />
                      {validationErrors[`ticketType-${ticketType.id}-name`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`ticketType-${ticketType.id}-name`]}</p>}
                    </div>
                    {/* Descripción del Tipo de Entrada */}
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 block mb-1 uppercase tracking-widest">Descripción del Tipo de Entrada</label>
                      <textarea
                        placeholder="Breve descripción de lo que incluye este tipo de entrada."
                        value={ticketType.description}
                        onChange={(e) => handleTicketTypeFieldChange(ticketType.id, "description", e.target.value ?? "")}
                        rows="2"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs outline-none text-white placeholder:text-zinc-700 resize-y"
                      ></textarea>
                    </div>
                    {/* Características del Tipo de Entrada (ej. lista de beneficios) */}
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 block mb-1 uppercase tracking-widest">Características (separadas por coma, ej: Barra libre, Acceso VIP)</label>
                      <input // Corregido: Filtrar cadenas vacías después de trim
                        type="text"
                        placeholder="Ej: Acceso rápido, Barra libre, Vista preferencial"
                        value={ticketType.features?.join(', ') ?? ''}
                        onChange={(e) => handleTicketTypeFieldChange(ticketType.id, "features", e.target.value.split(',').map(f => f.trim()))}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs outline-none text-white placeholder:text-zinc-700"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTicketType(ticketType.id)}
                        className="text-red-500 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        Eliminar Tipo
                      </button>
                    </div>

                    {/* Resumen de Precios y Próxima Etapa para este tipo de entrada */}
                    {ticketType.stages.length > 0 && (
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Resumen de Precios ({ticketType.name})</p>
                        {(() => {
                          const activeStage = getActiveTicketStageAndPrice(ticketType, new Date(testDate));
                          const sortedStages = [...ticketType.stages].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
                          const nextStage = sortedStages.find(s => new Date(s.start_date) > new Date(testDate));

                          return (
                            <>
                              {activeStage ? (
                                <p className="text-lime-400 font-bold text-sm">
                                  ACTUAL: S/.{activeStage.price} ({activeStage.stageName})
                                </p>
                              ) : (
                                <p className="text-red-400 font-bold text-sm">No hay etapa activa.</p>
                              )}
                              {nextStage && (
                                <p className="text-blue-400 font-bold text-sm">
                                  PRÓXIMA: S/.{nextStage.price} ({nextStage.name}) desde {formatToYYYYMMDD(nextStage.start_date)}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-4">Etapas:</h4>
                    <div className="space-y-3">
                      {ticketType.stages.map((stage) => {
                        const { status, color } = getStageStatus(stage, testDate);
                        return (
                          <div key={stage.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                            <div className="flex justify-between items-center">
                              <input
                                type="text"
                                placeholder="Nombre de la etapa (Ej: Preventa 1)"
                                value={stage.name}
                                onChange={(e) => handleStageChange(ticketType.id, stage.id, "name", e.target.value ?? "")}
                                className="bg-transparent text-sm font-bold text-white outline-none border-b border-zinc-700 focus:border-purple-500 w-full"
                              />
                              {validationErrors[`stage-${stage.id}-name`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`stage-${stage.id}-name`]}</p>}
                              <button
                                type="button"
                                onClick={() => removeStage(ticketType.id, stage.id)}
                                className="text-red-500 hover:text-red-400 transition-colors ml-4 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-zinc-500 block mb-1 uppercase tracking-widest">Precio</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={stage.price ?? ""}
                                onChange={(e) => handleStageChange(ticketType.id, stage.id, "price", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white outline-none"
                              />
                              {validationErrors[`stage-${stage.id}-price`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`stage-${stage.id}-price`]}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-black text-zinc-500 block mb-1 uppercase tracking-widest">Desde</label>
                                <input
                                  type="date"
                                  value={stage.start_date ?? ""}
                                  onChange={(e) => handleStageChange(ticketType.id, stage.id, "start_date", e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white outline-none"
                                />
                                {validationErrors[`stage-${stage.id}-start_date`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`stage-${stage.id}-start_date`]}</p>}
                              </div>
                              <div>
                                <label className="text-[10px] font-black text-zinc-500 block mb-1 uppercase tracking-widest">Hasta</label>
                                <input
                                  type="date"
                                  value={stage.end_date ?? ""}
                                  onChange={(e) => handleStageChange(ticketType.id, stage.id, "end_date", e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white outline-none"
                                />
                                {validationErrors[`stage-${stage.id}-end_date`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`stage-${stage.id}-end_date`]}</p>}
                              </div>
                            </div>
                            {validationErrors[`stage-${stage.id}-dates`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`stage-${stage.id}-dates`]}</p>}
                            {validationErrors[`stage-${stage.id}-overlap`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`stage-${stage.id}-overlap`]}</p>}
                            <p className={`text-xs font-bold ${color} mt-2`}>Estado: {status}</p>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => addStage(ticketType.id)}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-lg transition-colors mt-2"
                      >
                        + Agregar etapa
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTicketType}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-colors mt-4"
                >
                  + Agregar tipo de entrada
                </button>
              </div>

              {/* Vista Previa (simplificada) */}
              <div className="border-t border-zinc-900 pt-4 space-y-3">
                <h3 className="text-xl font-black uppercase tracking-tight text-cyan-400">Vista Previa (Usuario)</h3>
                {ticketTypes.map(ticketType => {
                  const activeStage = getActiveTicketStageAndPrice(ticketType, new Date(testDate));
                  if (!activeStage) return null;
                  return (
                    <div key={`preview-${ticketType.id}`} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                      <p className="text-white font-bold">{ticketType.name}</p>
                      <p className="text-lime-400 text-lg font-black">S/.{activeStage.price}</p>
                      <p className="text-zinc-400 text-sm">{activeStage.stageName}</p>
                      <p className="text-zinc-500 text-xs">Disponible hasta: {formatToYYYYMMDD(activeStage.end_date)}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Flyer / Imagen Principal</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-zinc-500 bg-zinc-950 border border-zinc-850 border-dashed rounded-xl p-3 file:bg-zinc-900 file:text-pink-400 cursor-pointer"
                />
                {formData.image && <p className="text-[10px] text-lime-400 font-bold mt-1">✓ FLYER PRINCIPAL LISTO</p>}
              </div>

              {/* 🗺️ DISTRIBUCIÓN / CROQUIS (NUEVO) */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Mapa de Distribución / Zonas</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDistributionUpload}
                  className="w-full text-xs text-zinc-500 bg-zinc-950 border border-zinc-850 border-dashed rounded-xl p-3 file:bg-zinc-900 file:text-purple-400 cursor-pointer"
                />
                {formData.local_distribution_image && <p className="text-[10px] text-lime-400 font-bold mt-1">✓ CROQUIS DE ZONAS LISTO</p>}
              </div>

              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Google Maps URL</label>
                <input
                  type="url"
                  name="maps"
                  placeholder="Enlace del local"
                  value={formData.maps}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs outline-none text-white placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">WhatsApp de Ventas</label>
                <input
                  type="url"
                  name="whatsapp"
                  placeholder="https://wa.me/..."
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs outline-none text-white placeholder:text-zinc-700"
                />
              </div>

              {/* 📝 DESCRIPCIÓN DEL EVENTO */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Descripción del Evento</label>
                <textarea
                  name="description"
                  placeholder="Detalles completos del evento, line-up, ambiente, etc."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none text-white placeholder:text-zinc-700 resize-y"
                ></textarea>
              </div>

              {/* 👤 ORGANIZADOR (Dropdown) */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Seleccionar Organizador</label>
                <select
                  name="organizer_id"
                  value={formData.organizer_id || ""}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none text-white focus:border-purple-500/50"
                >
                  <option value="">-- Seleccionar --</option>
                  {organizers.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              {/* 👗 DRESSCODE */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Dresscode</label>
                <input
                  type="text"
                  name="dresscode"
                  placeholder="Ej: Casual Elegante, Temático"
                  value={formData.dresscode}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs outline-none text-white placeholder:text-zinc-700"
                />
              </div>

              {/* 🔞 EDAD MÍNIMA */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Edad Mínima</label>
                <input
                  type="text"
                  name="min_age"
                  placeholder="Ej: +18, +21"
                  value={formData.min_age}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs outline-none text-white placeholder:text-zinc-700"
                />
              </div>

              {/* ⏰ HORA APERTURA */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Hora Apertura</label>
                <input
                  type="text"
                  name="opening_time"
                  placeholder="Ej: 10:00 PM"
                  value={formData.opening_time}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs outline-none text-white placeholder:text-zinc-700"
                />
              </div>

              {/* Publication Status */}
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Estado de Publicación</label>
                <select
                  name="publication_status"
                  value={formData.publication_status}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none text-white focus:border-purple-500/50"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="hidden">Oculto</option>
                </select>
              </div>

              <div className="flex items-center gap-3 py-1 bg-zinc-950/60 border border-zinc-900 rounded-xl p-3">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-pink-500 accent-pink-500 cursor-pointer"
                />
                <label htmlFor="featured" className="text-xs font-bold text-zinc-400 select-none cursor-pointer uppercase tracking-wider">
                  Destacar en el Hero principal
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={submitButtonClasses}
              >
                {isSubmitting ? "Sincronizando..." : editingId ? "💾 Guardar Cambios" : "🚀 Publicar Evento Line-Up"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData(initialFormState)
                  }}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white p-3 rounded-xl hover:bg-zinc-900 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN EVENTOS DISPONIBLES */}
          <div className="bg-zinc-900/30 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-zinc-850 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
              <div>
                <h2 className="text-2xl font-[900] tracking-tight uppercase">📅 Line-up de Carteleras</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">Eventos activos cargados en la base de datos de Supabase</p>
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="🔍 Filtrar evento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-3 text-xs outline-none focus:border-zinc-700 w-full text-white placeholder:text-zinc-600 font-medium pl-9"
                />
                <span className="absolute left-3 top-3.5 text-zinc-600 text-xs">⚡</span>
              </div>
            </div>

            <div className="grid gap-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {filteredEvents.length === 0 ? (
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center py-8 bg-zinc-950/20 border border-zinc-850/50 rounded-2xl border-dashed">
                  No se encontraron eventos cargados.
                </p>
              ) : (
                filteredEvents.map((event) => {
                  if (!event) return null
                  
                  const statusColors = {
                    activo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    periodo_de_gracia: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    evento_finalizado: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                    finalizado: "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }

                  return (
                    <div
                      key={event.id}
                      className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-850/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-500/40 hover:bg-zinc-950 transition-all duration-300 shadow-sm group"
                    >
                      <div className="flex gap-4 items-center w-full md:w-auto">
                        {event.image ? (
                          <img src={event.image} alt="" className="w-14 h-14 rounded-xl object-cover border border-zinc-800 flex-shrink-0 shadow-md" />
                        ) : (
                          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center font-black text-zinc-700 text-xs">FYP</div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-zinc-100 text-base tracking-tight group-hover:text-pink-400 transition-colors">{event.title}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColors[event.lifecycleStatus] || statusColors.activo}`}>
                              ● {event.lifecycleStatus?.replace(/_/g, ' ') || "activo"}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 font-medium">
                            📍 {event.location} <span className="text-zinc-600 px-1">•</span> <span className="text-lime-400 font-bold">S/.{Number(event.price || 0).toFixed(2)}</span>
                          </p>
                          <p className="text-[10px] font-bold text-purple-400/80 uppercase tracking-wider mt-0.5">📅 {event.date}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-900">
                        <button
                          onClick={() => handleEdit(event)}
                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 text-[11px] px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("¿Seguro que deseas eliminar este evento?")) deleteEvent(event.id)
                          }}
                          className="bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/20 text-[11px] px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* SECCIÓN SEGUIMIENTO DE RESERVAS */}
          <div className="bg-zinc-900/30 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-zinc-850 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-850/80 pb-4 mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-[900] tracking-tight uppercase">📊 Live Flow Reservas</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">Monitoreo en tiempo real de entradas pedidas vía WhatsApp</p>
              </div>
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850 text-[10px] font-black uppercase tracking-wider w-fit self-end">
                <button
                  onClick={() => setReservationView("general")}
                  className={`px-3 py-2 rounded-lg transition-all ${reservationView === "general" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  General
                </button>
                <button
                  onClick={() => setReservationView("events")}
                  className={`px-3 py-2 rounded-lg transition-all ${reservationView === "events" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Por Evento
                </button>
                {/* 🕒 NUEVA PESTAÑA: HISTORIAL */}
                <button
                  onClick={() => {
                    setReservationView("history")
                    void refetchHistory()
                  }}
                  className={`px-3 py-2 rounded-lg transition-all ${reservationView === "history" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  🕒 Historial Cierres
                </button>
              </div>
            </div>

            {/* VISTA GENERAL */}
            {reservationView === "general" && (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {safeReservations.length === 0 ? (
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center py-8 bg-zinc-950/20 border border-zinc-850/50 rounded-2xl border-dashed">No hay comandos entrantes de WhatsApp registrados.</p>
                ) : (
                  safeReservations.map((reservation) => (
                    <div
                      key={reservation?.id}
                      className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-850 flex justify-between items-center text-sm group hover:border-zinc-700 transition-colors"
                    >
                      <div>
                        <h4 className="font-extrabold text-zinc-200 group-hover:text-purple-400 transition-colors">{reservation?.events?.title || "Evento Base"}</h4>
                        <p className="text-[10px] font-mono text-zinc-600 mt-1 uppercase tracking-wider">REF ID: {reservation?.event_id}</p>
                      </div>
                      <div className="bg-zinc-950 border border-purple-500/30 text-lime-400 px-4 py-2 rounded-xl font-mono text-xs font-black">
                        x{reservation?.quantity || 0} UNDS
                      </div> {/* Aquí se podría mostrar el ticket_type si se recupera */}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VISTA DETALLADA POR EVENTO */}
            {reservationView === "events" && (
              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {reservationsByEvent.length === 0 ? (
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center py-8 bg-zinc-950/20 border border-zinc-850/50 rounded-2xl border-dashed">No hay métricas agrupadas.</p>
                ) : (
                  reservationsByEvent.map((event) => {
                    if (!event || !event.id) return null;
                    const totalTickets = event.reservations?.reduce((sum, r) => sum + (r?.quantity || 0), 0) || 0

                    return (
                      <div key={event.id} className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-850/80">
                        <div className="flex justify-between items-start mb-4 border-b border-zinc-900 pb-3">
                          <div>
                            <h3 className="font-black text-base text-zinc-100 uppercase tracking-tight">📁 {event.title || "Evento Desconocido"}</h3>
                            <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">Estado: <span className="text-purple-400 font-black">{event.lifecycleStatus || "activo"}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Taquilla</p>
                            <p className="text-base font-black text-emerald-400 font-mono">{totalTickets} TIX</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Tráfico WhatsApp entrante ({event.reservations?.length || 0}):</p>
                          {event.reservations && event.reservations.length > 0 ? (
                            event.reservations.map((res) => {
                              if (!res) return null;
                              return (
                                <div key={res.id} className="bg-zinc-950/80 p-3 rounded-xl flex justify-between items-center text-xs border border-zinc-900">
                                  <span className="font-mono text-zinc-500 text-[11px]">TIX-REF: #{res.id ? String(res.id).substring(0, 8).toUpperCase() : "..."}</span>
                                  <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg font-black font-mono text-[11px]">x{res.quantity || 0}</span>
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-xs text-zinc-600 italic font-medium pl-1">0 órdenes registradas para este Line-up.</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* 🕒 NUEVA VISTA: HISTORIAL DE RESERVAS RESPALDADAS */}
            {reservationView === "history" && (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {loadingHistory ? (
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest text-center py-8">Consultando baúl seguro de registros...</p>
                ) : history.length === 0 ? (
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center py-8 bg-zinc-950/20 border border-zinc-850/50 rounded-2xl border-dashed">No hay cierres históricos guardados en el tiempo de gracia.</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 flex justify-between items-center text-sm group hover:border-zinc-800 transition-colors"
                    >
                      <div>
                        <h4 className="font-extrabold text-zinc-300 group-hover:text-pink-400 transition-colors">📦 {item.event_title || "Evento Borrado"}</h4>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {item.ticket_type && (
                            <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{item.ticket_type}</span>
                          )}
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">RESERVA-ID: #{String(item.reservation_id).substring(0,8).toUpperCase()}</span>
                          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                            ● {item.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-mono text-xs font-black">
                        x{item.quantity || 0} TIX
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

          {/* NUEVA SECCIÓN: REGISTRO DE ADMINISTRADORES */}
          <div className="bg-zinc-900/30 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-zinc-850 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-850/80 pb-4 mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-[900] tracking-tight uppercase">🛡️ Gestión de Administradores</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">Registra nuevos usuarios con rol de administrador.</p>
              </div>
            </div>

            <form onSubmit={handleRegisterNewAdmin} className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Email del Nuevo Administrador</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none transition-all duration-300 text-white placeholder:text-zinc-600 font-medium focus:border-pink-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-purple-400 block mb-1.5 uppercase tracking-widest">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-sm outline-none transition-all duration-300 text-white placeholder:text-zinc-600 font-medium focus:border-pink-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting} // Reutilizamos el estado de envío
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black uppercase tracking-widest p-4 rounded-xl transition-all duration-300 text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "➕ Registrar Nuevo Admin"}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  )
}