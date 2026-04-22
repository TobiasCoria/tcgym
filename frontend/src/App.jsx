import Admin from './pages/Admin';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import MisDatos from './pages/MisDatos';
import Turnos from './pages/Turnos';

const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><span className="text-white text-xl">Cargando...</span></div>;
  return usuario ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<RutaProtegida><Home /></RutaProtegida>} />
          <Route path="/mis-datos" element={<RutaProtegida><MisDatos /></RutaProtegida>} />
          <Route path="/turnos" element={<RutaProtegida><Turnos /></RutaProtegida>} />
          <Route path="/admin" element={<RutaProtegida><Admin /></RutaProtegida>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;