import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Updated paths to match your folder structure (src/pages/...)
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/pages/auth/RegisterPage"; // Double check if auth is inside pages
import Dashboard from "./pages/dashboard/Dashboard";
import CertificatesPage from "./pages/dashboard/CertificatesPage";
import UploadPage from "./pages/dashboard/UploadPage";
import VerifyPage from "./pages/dashboard/VerifyPage";

// HomePage and Navbar
import HomePage from "./HomePage"; 
import Navbar from "./pages/components/Navbar"; // Based on your image, components is inside pages

function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/verify" element={<VerifyPage />} />
      </Routes>
    </Router>
  );
}

export default App;