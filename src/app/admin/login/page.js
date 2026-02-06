'use client';
import { login } from '../../actions'; // Importamos la función de seguridad
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleLogin(formData) {
    const res = await login(formData);
    if (res.success) {
      router.push('/admin'); // Si es correcto, entra al panel
    } else {
      setError('❌ Clave incorrecta');
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <form action={handleLogin} className="w-full max-w-md bg-[#111] p-8 rounded-2xl border border-[#c5a059]/30 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#c5a059] mb-2">Acceso Privado</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Solo Personal Autorizado</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[#c5a059] text-xs font-bold uppercase block mb-2">Usuario</label>
            <input name="username" type="text" className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#c5a059] outline-none" />
          </div>
          <div>
            <label className="text-[#c5a059] text-xs font-bold uppercase block mb-2">Contraseña</label>
            <input name="password" type="password" className="w-full bg-black border border-gray-800 text-white p-3 rounded focus:border-[#c5a059] outline-none" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <button className="w-full mt-6 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold py-3 rounded transition-all uppercase tracking-widest">
          Entrar
        </button>
      </form>
    </div>
  );
}