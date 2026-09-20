import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import EventDetails from "./pages/EventDetails"
import PublicLayout from "./layouts/PublicLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import ProtectedRoute from "./routes/ProtectedRoute"
import NotFound from "./pages/NotFound"

// Code Splitting: Solo descarga esto si entran a estas rutas
const Admin = lazy(() => import("./pages/Admin"))
const Login = lazy(() => import("./pages/Login"))

// Loader genérico mientras descarga el componente
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/evento/:slug" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes (protegidas) */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App