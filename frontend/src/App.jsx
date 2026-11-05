import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pandits from "./pages/Pandits";
import PanditProfile from "./pages/PanditProfile";
import BookingPage from "./pages/BookingPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import PanditDashboard from "./pages/PanditDashboard";
import PanditProfileEdit from "./pages/PanditProfileEdit";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pandits" element={<Pandits />} />
          <Route path="/pandits/:id" element={<PanditProfile />} />

          <Route
            path="/book/:panditId"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pandit/dashboard"
            element={
              <ProtectedRoute allowedRoles={["pandit"]}>
                <PanditDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pandit/profile"
            element={
              <ProtectedRoute allowedRoles={["pandit"]}>
                <PanditProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
