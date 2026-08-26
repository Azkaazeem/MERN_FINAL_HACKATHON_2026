import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
// import { useRef } from 'react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useGSAP } from '@gsap/react'; // agar useGSAP hook use karna ho

// // Plugins ko register karna zaroori hota hai
// gsap.registerPlugin(ScrollTrigger);

// Sample Pages / Placeholders
const Home = () => <div className="p-8 text-center text-2xl">Welcome to Home Page</div>;
const Login = () => <div className="p-8 text-center text-2xl">Login Form Here</div>;
const Register = () => <div className="p-8 text-center text-2xl">Register Form Here</div>;
const Dashboard = () => <div className="p-8 text-center text-2xl font-bold">Protected Dashboard Area</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <main className="min-h-screen bg-slate-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;