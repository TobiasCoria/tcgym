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
  const [foto, setFoto] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
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
        if (data.rutina_archivo) setArchivo(data.rutina_archivo);
        if (data.foto_perfil) setFoto(data.foto_perfil);
      } catch {}
    };
    cargarPerfil();
  }, []);

  const handleGuardar = async () => {
    setCargando(true);
    setError('');
    try {
      await api.put('/usuarios/perfil', form);

      if (archivoFile) {
        const fd1 = new FormData();
        fd1.append('rutina', archivoFile);
        await api.post('/usuarios/rutina', fd1, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (fotoFile) {
  const fd2 = new FormData();
  fd2.append('foto', fotoFile);

  const { data } = await api.post('/usuarios/foto', fd2, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // 🔥 actualizar foto automáticamente
  if (data.foto) {
    setFoto(data.foto);
    setFotoFile(null); // limpia preview
  }
}

      setGuardado(true);
      setArchivoFile(null);
      setFotoFile(null);
      setTimeout(() => setGuardado(false), 2500);
    } catch {
      setError('Error al guardar los datos');
    } finally {
      setCargando(false);
    }
  };

  const imc =
    form.peso && form.estatura
      ? (form.peso / Math.pow(form.estatura / 100, 2)).toFixed(1)
      : null;

  let imcLabel = '';
  let imcColor = '';

  if (imc) {
    if (imc < 18.5) { imcLabel = 'Bajo peso'; imcColor = '#60a5fa'; }
    else if (imc < 25) { imcLabel = 'Peso normal'; imcColor = '#4ade80'; }
    else if (imc < 30) { imcLabel = 'Sobrepeso'; imcColor = '#facc15'; }
    else { imcLabel = 'Obesidad'; imcColor = '#f87171'; }
  }

  const fotoUrl = fotoFile
    ? URL.createObjectURL(fotoFile)
    : foto
    ? 'https://tcgym.onrender.com/uploads/' + foto
    : null;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden">
      {/* FONDO */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-100px] right-[-80px] w-[350px] h-[350px] bg-orange-500/8 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[250px] h-[250px] bg-orange-500/6 rounded-full blur-[80px] animate-glow-pulse" style={{animationDelay:'1.2s'}} />
        <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] bg-orange-500/5 rounded-full blur-[60px] animate-glow-pulse" style={{animationDelay:'0.6s'}} />
      </div>

      {/* HEADER */}
      <div className="relative flex items-center gap-4 px-6 py-5 border-b border-white/5 animate-fadeIn">
        <button onClick={() => navigate('/home')} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white">
          ←
        </button>
        <h1 className="text-white font-bold text-lg">Mis datos</h1>
      </div>

      <div className="relative px-6 pt-6 pb-10 max-w-sm mx-auto space-y-3">

        {/* PERFIL */}
        <div className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl px-6 py-5 flex items-center gap-4">
          <label className="relative cursor-pointer shrink-0 group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/25">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {usuario?.nombre?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">Cambiar</span>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) setFotoFile(f);
              }}
              className="hidden"
            />
          </label>

          <div>
            <p className="text-white font-bold text-lg leading-tight">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="text-white/40 text-sm mt-0.5">{usuario?.email}</p>
            <p className="text-white/20 text-xs mt-1">Tocá la foto para cambiarla</p>
          </div>
        </div>

        {/* PESO */}
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

        {/* ESTATURA */}
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

        {/* FECHA */}
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
          <div className="animate-scaleIn bg-white/5 border border-white/8 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">IMC calculado</p>
              <p style={{color: imcColor}} className="text-sm font-semibold">{imcLabel}</p>
            </div>
            <p style={{color: imcColor}} className="text-4xl font-bold">{imc}</p>
          </div>
        )}

        {/* RUTINA */}
        <div className="animate-fadeIn delay-300 bg-white/5 border border-white/8 rounded-2xl px-5 py-4">
          <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Mi rutina</label>

          {archivo && !archivoFile && (
            <a
              href={'https://tcgym.onrender.com/uploads/' + archivo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 w-full border border-white/10 hover:border-orange-500/40 rounded-xl py-4 px-4 mb-3 transition-all"
            >
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-xl">📄</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{archivo}</p>
                <p className="text-orange-400 text-xs mt-0.5">Ver rutina</p>
              </div>
            </a>
          )}

          <label className="flex items-center gap-4 w-full border border-dashed border-white/15 hover:border-orange-500/40 rounded-xl py-5 px-4 cursor-pointer transition-all group">
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  setArchivo(f.name);
                  setArchivoFile(f);
                }
              }}
              className="hidden"
            />
            <div className="w-10 h-10 bg-white/5 group-hover:bg-orange-500/10 rounded-xl flex items-center justify-center transition-colors shrink-0">
              <span className="text-xl">📤</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">
                {archivoFile ? archivoFile.name : archivo ? 'Cambiar rutina' : 'Subir rutina'}
              </p>
              <p className="text-white/30 text-xs mt-0.5">
                {archivoFile ? 'Listo para guardar' : 'PDF o Excel'}
              </p>
            </div>
          </label>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-medium animate-scaleIn">
            {error}
          </div>
        )}

        {/* BOTON */}
        <button
          onClick={handleGuardar}
          disabled={cargando}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide"
        >
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* TOAST */}
      {guardado && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-green-500/30 text-green-400 px-6 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-2 animate-scaleIn">
          Datos guardados correctamente
        </div>
      )}
    </div>
  );
}