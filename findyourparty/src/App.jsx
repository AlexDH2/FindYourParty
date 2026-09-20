import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Páginas
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Reservations from './pages/Reservations';
import Admin from './pages/Admin';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rutas Públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/evento/:id" element={<EventDetails />} />
          <Route path="/reservas" element={<Reservations />} />
        </Route>

        {/* 2. Login Independiente (Pantalla completa sin barra lateral) */}
        <Route path="/login" element={<Login />} />

        {/* 3. Panel de Administración (Con la barra lateral del Dashboard) */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* 4. Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}