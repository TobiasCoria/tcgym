import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MisDatos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [archivo, setArchivo] = useState(null);
const [archivoFile, setArchivoFile] = useState(null);
  const [form, setForm] = useState({ peso: '', estatura: '', fecha_nacimiento: '' });

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data } = await api.get('/usuarios/perfil');
        setForm({
          peso: data.peso || '',
          estatura: data.estatura || '',
          fecha_nacimiento: data.fecha_nacimiento?.split('T')[0] || '',
        });
      } catch {}
    };
    cargarPerfil();
  }, []);

  const handleGuardar = async () => {
  setCargando(true);
  setError('');
  try {
    // Guardar datos del perfil
    await api.put('/usuarios/perfil', form);

    // Si hay archivo nuevo, subirlo
    if (archivoFile) {
      const formData = new FormData();
      formData.append('rutina', archivoFile);
      await api.post('/usuarios/rutina', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  } catch {
    setError('Error al guardar los datos');
  } finally {
    setCargando(false);
  }
};
  const imc = form.peso && form.estatura
    ? (form.peso / Math.pow(form.estatura / 100, 2)).toFixed(1)
    : null;

  const imcInfo = imc
    ? imc < 18.5 ? { label: 'Bajo peso', color: 'text-blue-400', border: 'border-blue-500/30' }
    : imc < 25   ? { label: 'Peso normal', color: 'text-green-400', border: 'border-green-500/30' }
    : imc < 30   ? { label: 'Sobrepeso', color: 'text-yellow-400', border: 'border-yellow-500/30' }
    :               { label: 'Obesidad', color: 'text-red-400', border: 'border-red-500/30' }
    : null;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden">

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-100px] right-[-80px] w-[350px] h-[350px] bg-orange-500/8 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[250px] h-[250px] bg-orange-500/6 rounded-full blur-[80px] animate-glow-pulse" style={{animationDelay:'1.2s'}} />
        <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] bg-orange-500/5 rounded-full blur-[60px] animate-glow-pulse" style={{animationDelay:'0.6s'}} />
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-4 px-6 py-5 border-b border-white/5 animate-fadeIn">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white"
        >←</button>
        <h1 className="text-white font-bold text-lg">Mis datos</h1>
      </div>

      <div className="relative px-6 pt-6 pb-10 max-w-sm mx-auto space-y-3">

        {/* Perfil */}
        <div className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/25 shrink-0">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="text-white/40 text-sm mt-0.5">{usuario?.email}</p>
          </div>
        </div>

        {/* Peso */}
        <div className="animate-fadeIn delay-100 bg-white/5 border border-white/8 hover:border-orange-500/30 rounded-2xl px-5 py-4 transition-all">
          <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Peso (kg)</label>
          <input
            type="number"
            placeholder="75"
            value={form.peso}
            onChange={(e) => setForm({ ...form, peso: e.target.value })}
            className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none placeholder-white/15"
          />
        </div>

        {/* Estatura */}
        <div className="animate-fadeIn delay-200 bg-white/5 border border-white/8 hover:border-orange-500/30 rounded-2xl px-5 py-4 transition-all">
          <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Estatura (cm)</label>
          <input
            type="number"
            placeholder="175"
            value={form.estatura}
            onChange={(e) => setForm({ ...form, estatura: e.target.value })}
            className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none placeholder-white/15"
          />
        </div>

        {/* Fecha */}
        <div className="animate-fadeIn delay-300 bg-white/5 border border-white/8 hover:border-orange-500/30 rounded-2xl px-5 py-4 transition-all">
          <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Fecha de nacimiento</label>
          <input
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
            className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none [color-scheme:dark]"
          />
        </div>

        {/* IMC */}
        {imc && (
          <div className={`animate-scaleIn bg-white/5 border ${imcInfo.border} rounded-2xl px-5 py-4 flex items-center justify-between`}>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">IMC calculado</p>
              <p className={`text-sm font-semibold ${imcInfo.color}`}>{imcInfo.label}</p>
            </div>
            <p className={`text-4xl font-bold ${imcInfo.color}`}>{imc}</p>
          </div>
        )}

        {/* Rutina */}
        <div className="animate-fadeIn delay-300 bg-white/5 border border-white/8 rounded-2xl px-5 py-4">
          <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Mi rutina</label>
          <label className="flex items-center gap-4 w-full border border-dashed border-white/15 hover:border-orange-500/40 rounded-xl py-5 px-4 cursor-pointer transition-all group">
            <input
  type="file"
  accept=".pdf,.xlsx,.xls"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file.name);
      setArchivoFile(file);
    }
  }}
  className="hidden"
/>
            <div className="w-10 h-10 bg-white/5 group-hover:bg-orange-500/10 rounded-xl flex items-center justify-center transition-colors shrink-0">
              <span className="text-xl">{archivo ? '📄' : '📤'}</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{archivo || 'Subir rutina'}</p>
              <p className="text-white/30 text-xs mt-0.5">{archivo ? 'Listo para guardar' : 'PDF o Excel'}</p>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-medium animate-scaleIn">
            {error}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={handleGuardar}
          disabled={cargando}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide"
        >
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* Toast */}
      {guardado && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-green-500/30 text-green-400 px-6 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-2 animate-scaleIn">
          ✓ Datos guardados correctamente
        </div>
      )}
    </div>
  );
}