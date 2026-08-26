import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import EventDetails from "./pages/EventDetails"
import Admin from "./pages/Admin"
import PublicLayout from "./layouts/PublicLayout"
import Login from "./pages/Login" // Importar Login
import DashboardLayout from "./layouts/DashboardLayout"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/evento/:slug" element={<EventDetails />} /> {/* Cambiado a slug */}
        </Route>

        {/* Admin Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/login" element={<Login />} /> {/* Mover Login aquí si es parte del dashboard layout o dejarlo fuera si es independiente */}
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App