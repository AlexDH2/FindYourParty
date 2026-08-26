# FindYourParty - TODO (Olas de refactorización)

## OLA 1 – Arquitectura
- [ ] Analizar completamente el proyecto y dependencias (frontend + supabase usage).
- [ ] Crear estructura de carpetas: components, pages, layouts, dashboard, hooks, services, context, utils, constants.
- [ ] Separar EventContext (o migrarlo hacia hooks + services) sin romper API actual.
- [ ] Crear services: eventService, organizerService, reservationService, storageService.
- [ ] Migrar lógica de Supabase desde components/context hacia services.
- [ ] Eliminar duplicación de lógica (whatsappUrl builder, status parsing, etc.) vía utils.
- [ ] Mantener la interfaz visual igual (Home/EventDetails/EventCard/Admin/Login).
- [ ] Ejecutar lint/build.
- [ ] Verificar en consola que no hay errores.
- [ ] Verificar que: Home, EventDetails (compra WhatsApp), Admin CRUD y historial, y reservas sigan operativas.

## OLA 2 – Supabase y Base de Datos
- [ ] Revisar triggers problemáticos, eliminar loops.
- [ ] Corregir lifecycle (active/grace/finalized/archived/deleted) sin lógica frágil.
- [ ] Normalizar tablas y relaciones.
- [ ] Configurar RLS (roles admin/organizer) y políticas.
- [ ] Optimizar consultas.
- [ ] Verificar que no hay errores 400/500/Stack Depth.

## OLA 3 – Interfaz Pública
- [ ] Rediseñar Home (secciones premium).
- [ ] Landing individual por evento (secciones premium, mini-landing).
- [ ] Página pública organizadores.
- [ ] Galería, video opcional, lineup, tipos de entradas ilimitados.
- [ ] Dresscode, edad mínima, countdown, eventos relacionados.
- [ ] Mejorar cards y performance (memo/lazy).

## OLA 4 – Panel SaaS
- [ ] Reconstruir Admin como dashboard SaaS: sidebar, cards, gráficos, calendario, filtros.
- [ ] Gestión organizadores/eventos/reservas.
- [ ] Acciones rápidas + actividad reciente.

## OLA 5 – Funciones Premium
- [ ] Recuerdos (pestaña separada).
- [ ] Comentarios + Calificaciones (evento/organizador/discoteca) y promedios.
- [ ] Sistema QR (placeholder de arquitectura).
- [ ] Notificaciones + preparación IA.
- [ ] Arquitectura preparada para app móvil.

