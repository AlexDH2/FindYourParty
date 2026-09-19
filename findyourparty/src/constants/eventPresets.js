import { formatToYYYYMMDD } from "../utils/dateUtils"

export const VENUE_PRESETS = {
  kan_kun: {
    location: "Club Kan Kun (Venecia, Lurín)",
    maps: "https://maps.google.com/?q=Club+Kan+Kun+Lurin",
    whatsapp: "https://wa.me/51941100488"
  },
  green_arena: {
    location: "Green Arena (Lurín)",
    maps: "https://www.google.com/maps/place/Green+Arena/@-12.2771,-76.8960967,13z",
    whatsapp: "https://wa.me/51941100488"
  }
}

export function getTicketMatrixPreset(eventDate) {
  const defaultDate = eventDate || formatToYYYYMMDD(new Date())
  return [
    {
      id: Date.now(),
      name: "General",
      slug: "general",
      description: "Acceso al evento, zona general, piscina, glitter bar, túnel del terror y concurso.",
      features: ["Acceso General", "Piscina", "Glitter Bar & Tatuajes", "Túnel del Terror", "Concurso"],
      stages: [
        { id: Date.now() + 1, name: "Preventa 1", price: "30", start_date: "2026-09-01", end_date: "2026-09-20" },
        { id: Date.now() + 2, name: "Preventa 2", price: "40", start_date: "2026-09-21", end_date: "2026-10-10" },
        { id: Date.now() + 3, name: "Preventa 3", price: "50", start_date: "2026-10-11", end_date: "2026-10-25" },
        { id: Date.now() + 4, name: "Preventa 4", price: "70", start_date: "2026-10-26", end_date: defaultDate }
      ]
    },
    {
      id: Date.now() + 10,
      name: "VIP",
      slug: "vip",
      description: "Ingreso preferencial, zona VIP, pulsera personalizada, barra privada y show de magia.",
      features: ["Ingreso Preferencial", "Zona VIP", "Pulsera VIP", "Barra Privada", "Piscina"],
      stages: [
        { id: Date.now() + 11, name: "Preventa 1", price: "45", start_date: "2026-09-01", end_date: "2026-09-20" },
        { id: Date.now() + 12, name: "Preventa 2", price: "55", start_date: "2026-09-21", end_date: "2026-10-10" },
        { id: Date.now() + 13, name: "Preventa 3", price: "65", start_date: "2026-10-11", end_date: "2026-10-25" },
        { id: Date.now() + 14, name: "Preventa 4", price: "90", start_date: "2026-10-26", end_date: defaultDate }
      ]
    },
    {
      id: Date.now() + 20,
      name: "SuperVIP",
      slug: "supervip",
      description: "Zona SuperVIP, piscina exclusiva, toro mecánico, castillo del terror y paintball.",
      features: ["Ingreso Preferencial", "SuperVIP", "Piscina Exclusiva", "Toro Mecánico", "Paintball"],
      stages: [
        { id: Date.now() + 21, name: "Preventa 1", price: "70", start_date: "2026-09-01", end_date: "2026-09-20" },
        { id: Date.now() + 22, name: "Preventa 2", price: "80", start_date: "2026-09-21", end_date: "2026-10-10" },
        { id: Date.now() + 23, name: "Preventa 3", price: "90", start_date: "2026-10-11", end_date: "2026-10-25" },
        { id: Date.now() + 24, name: "Preventa 4", price: "120", start_date: "2026-10-26", end_date: defaultDate }
      ]
    }
  ]
}

export function getTablesPreset(eventDate) {
  const defaultDate = eventDate || formatToYYYYMMDD(new Date())
  return [
    {
      id: Date.now() + 30,
      name: "Mesa General (8px)",
      slug: "mesa-general-8px",
      description: "Ingreso 8 personas, atención personalizada, zona general y S/. 405 en consumo.",
      features: ["8 Personas", "S/. 405 en Consumo", "Atención Personalizada"],
      stages: [{ id: Date.now() + 31, name: "Precio Único", price: "450", start_date: "2026-09-01", end_date: defaultDate }]
    },
    {
      id: Date.now() + 40,
      name: "Mesa VIP (8px)",
      slug: "mesa-vip-8px",
      description: "Ingreso 8 personas, atención personalizada, zona VIP y S/. 675 en consumo.",
      features: ["8 Personas", "S/. 675 en Consumo", "Atención Personalizada", "Zona VIP"],
      stages: [{ id: Date.now() + 41, name: "Precio Único", price: "750", start_date: "2026-09-01", end_date: defaultDate }]
    },
    {
      id: Date.now() + 50,
      name: "Mesa SuperVIP (8px)",
      slug: "mesa-supervip-8px",
      description: "Ingreso 8 personas, atención personalizada, zona SuperVIP y S/. 900 en consumo.",
      features: ["8 Personas", "S/. 900 en Consumo", "Atención Personalizada", "Zona SuperVIP"],
      stages: [{ id: Date.now() + 51, name: "Precio Único", price: "1000", start_date: "2026-09-01", end_date: defaultDate }]
    }
  ]
}

export function getPromo4x3Preset(eventDate) {
  const defaultDate = eventDate || formatToYYYYMMDD(new Date())
  return [
    {
      id: Date.now() + 60,
      name: "Promo 4x3 General",
      slug: "promo-4x3-general",
      features: ["4 Entradas General"],
      stages: [{ id: Date.now() + 61, name: "Preventa 1", price: "90", start_date: "2026-09-01", end_date: defaultDate }]
    },
    {
      id: Date.now() + 70,
      name: "Promo 4x3 VIP",
      slug: "promo-4x3-vip",
      features: ["4 Entradas VIP"],
      stages: [{ id: Date.now() + 71, name: "Preventa 1", price: "135", start_date: "2026-09-01", end_date: defaultDate }]
    },
    {
      id: Date.now() + 80,
      name: "Promo 4x3 SuperVIP",
      slug: "promo-4x3-supervip",
      features: ["4 Entradas SuperVIP"],
      stages: [{ id: Date.now() + 81, name: "Preventa 1", price: "210", start_date: "2026-09-01", end_date: defaultDate }]
    }
  ]
}

export function getParkingPreset(eventDate) {
  const defaultDate = eventDate || formatToYYYYMMDD(new Date())
  return {
    id: Date.now() + 90,
    name: "Estacionamiento Seguro",
    slug: "estacionamiento",
    features: ["1 Vehículo", "Seguridad Privada"],
    stages: [{ id: Date.now() + 91, name: "Tarifa Plana", price: "30", start_date: "2026-09-01", end_date: defaultDate }]
  }
}