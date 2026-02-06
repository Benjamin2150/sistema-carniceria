'use client';
import { useState, useEffect } from 'react';
import { obtenerProductos, crearPedido } from './actions';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  
  // Formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function cargar() {
      const data = await obtenerProductos();
      setProductos(data);
    }
    cargar();
  }, []);

  // Lógica Carrito
  const agregar = (p) => {
    const existe = carrito.find(item => item.id === p.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === p.id ? {...item, cantidad: item.cantidad + 1} : item));
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1 }]);
    }
    setCarritoAbierto(true);
  };

  const restar = (id) => {
    const existe = carrito.find(item => item.id === id);
    if (existe.cantidad > 1) {
      setCarrito(carrito.map(item => item.id === id ? {...item, cantidad: item.cantidad - 1} : item));
    } else {
      setCarrito(carrito.filter(item => item.id !== id));
    }
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const confirmarPedido = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const res = await crearPedido({ nombreCliente: nombre, telefono, carrito, total });
    if (res.success) {
      alert(`⚜️ ¡PEDIDO #${res.id} CONFIRMADO! \nGracias por preferir la calidad de Carnes Escobar.`);
      setCarrito([]);
      setNombre("");
      setTelefono("");
      setCarritoAbierto(false);
    } else {
      alert("Hubo un error al enviar el pedido.");
    }
    setEnviando(false);
  };

  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];
  
  const productosVisibles = productos.filter(p => {
    return (filtro === "Todos" || p.categoria === filtro) &&
           p.nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#0c120e] text-[#e2e8f0] font-sans selection:bg-amber-500 selection:text-black">
      
      {/* --- NAVBAR DE LUJO --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#063b1e]/95 backdrop-blur-md border-b border-[#c5a059]/30 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-[#c5a059] shadow-lg shadow-amber-900/20 overflow-hidden bg-black p-0.5">
              <img src="/logo.jpg" alt="Escobar" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-serif font-bold tracking-widest text-[#f0e6d2]">
                CARNES <span className="text-[#c5a059]">ESCOBAR</span>
              </h1>
              <p className="text-[10px] text-[#c5a059] tracking-[0.3em] uppercase border-t border-[#c5a059]/30 mt-1 pt-1">
                Calidad & Sabor desde 1985
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setCarritoAbierto(!carritoAbierto)}
            className="relative bg-[#c5a059] hover:bg-[#b08d48] text-[#062c16] px-6 py-2 rounded-sm transition-all shadow-lg font-bold flex items-center gap-2 uppercase tracking-wider text-sm"
          >
            <span>Mi Bandeja</span>
            <span className="bg-[#062c16] text-[#c5a059] w-6 h-6 flex items-center justify-center rounded-full text-xs border border-[#c5a059]">
              {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
            </span>
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-40 pb-20 px-4 text-center bg-[url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c120e]/90 via-[#0c120e]/70 to-[#0c120e]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto border border-[#c5a059]/20 p-8 rounded-lg bg-black/40 backdrop-blur-sm shadow-2xl">
          <span className="block text-[#c5a059] text-sm font-bold tracking-[0.5em] mb-4 uppercase">Artesanos de la Carne</span>
          <h2 className="text-5xl md:text-7xl font-serif font-medium text-white mb-6 drop-shadow-lg">
            Cortes <span className="italic text-[#c5a059]">Premium</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 font-light max-w-2xl mx-auto border-l-2 border-[#c5a059] pl-6 italic">
            "Del campo a su mesa con la tradición que nos caracteriza. Especialistas en cortes seleccionados."
          </p>
          
          <div className="max-w-xl mx-auto relative group">
            <input 
              type="text" 
              placeholder="¿Qué corte necesita hoy?..." 
              className="w-full bg-[#0c120e] border border-[#c5a059]/50 text-[#f0e6d2] placeholder-gray-500 rounded-sm py-4 pl-6 pr-12 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition shadow-2xl"
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="absolute right-4 top-4 text-[#c5a059]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* --- CATÁLOGO --- */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center flex-wrap gap-4 mb-12">
          {categorias.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFiltro(cat)}
              className={`px-8 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 border-b-2
              ${filtro === cat 
                ? 'text-[#c5a059] border-[#c5a059] scale-105' 
                : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {productosVisibles.map((p) => (
            <div key={p.id} className="group bg-[#161b18] border border-gray-800 hover:border-[#c5a059]/50 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#c5a059]/10 overflow-hidden relative rounded-sm">
              <div className="relative h-64 overflow-hidden bg-[#0a0f0c] border-b border-[#c5a059]/10">
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#2a352f] group-hover:text-[#c5a059]/30 transition">
                    <svg className="w-20 h-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span className="text-[10px] tracking-[0.3em] uppercase">Carnes Escobar</span>
                  </div>
                )}
                {p.plu && <div className="absolute top-0 right-0 bg-[#c5a059] text-[#062c16] text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-lg">#{p.plu}</div>}
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-serif text-[#f0e6d2] mb-1 group-hover:text-[#c5a059] transition">{p.nombre}</h3>
                  <div className="w-8 h-0.5 bg-[#c5a059]/50 group-hover:w-full transition-all duration-500"></div>
                  <p className="text-xs text-gray-500 uppercase mt-2">{p.categoria}</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Valor Kilo</span>
                    <span className="text-2xl font-serif text-[#c5a059] font-medium">${p.precio.toLocaleString('es-CL')}</span>
                  </div>
                  <button onClick={() => agregar(p)} className="bg-[#161b18] border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#062c16] px-5 py-2 text-sm uppercase tracking-wider font-bold transition-all duration-300 rounded-sm">
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- FOOTER CON CANDADO DE ADMIN --- */}
      <footer className="bg-[#050806] border-t border-[#c5a059]/20 mt-20 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
           <div>
              <h3 className="text-3xl font-serif text-[#c5a059] mb-8">Nuestra Carnicería</h3>
              <div className="space-y-6 text-gray-400 font-light">
                 <p className="flex items-center gap-4 group">
                    <span className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-black transition">📍</span> 
                    <span>Valparaíso, Chile</span>
                 </p>
                 <p className="flex items-center gap-4 group">
                    <span className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-black transition">🕒</span> 
                    <span>Lunes a Sábado: 09:00 - 20:00 hrs</span>
                 </p>
                 <p className="flex items-center gap-4 group">
                    <span className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-black transition">📞</span> 
                    <span>+56 9 1234 5678</span>
                 </p>
              </div>
           </div>
           
           <div className="h-72 w-full border border-[#c5a059]/30 rounded-lg overflow-hidden relative shadow-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3344.869687483664!2d-71.613303!3d-33.048757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9689e0bc87766571%3A0x6295556276435c7e!2sValpara%C3%ADso!5e0!3m2!1ses!2scl!4v1700000000000!5m2!1ses!2scl" 
                width="100%" height="100%" style={{border:0, filter: 'grayscale(100%) invert(92%) contrast(83%)'}} allowFullScreen="" loading="lazy">
              </iframe>
              <div className="absolute inset-0 pointer-events-none border-4 border-[#c5a059]/10"></div>
           </div>
        </div>
        
        {/* BARRA INFERIOR CON ACCESO JEFE */}
        <div className="flex justify-between items-center text-gray-600 text-xs mt-16 pt-8 border-t border-[#111]">
            <span className="uppercase tracking-widest">© 2026 Carnicería Escobar • Tradición y Prestigio</span>
            
            <a href="/admin/login" className="flex items-center gap-2 hover:text-[#c5a059] transition p-2" title="Acceso Administrativo">
                <span className="hidden md:inline">Acceso Personal</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </a>
        </div>
      </footer>

      {/* --- SIDEBAR CARRITO --- */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#0c120e] shadow-2xl transform transition-transform duration-500 z-[60] border-l border-[#c5a059]/20 flex flex-col ${carritoAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-[#c5a059]/20 flex justify-between items-center bg-[#080c09]">
          <h2 className="text-2xl font-serif text-[#c5a059] flex items-center gap-3">
            <span>🛒</span> Su Pedido
          </h2>
          <button onClick={() => setCarritoAbierto(false)} className="text-gray-500 hover:text-[#c5a059] transition text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <p className="text-sm uppercase tracking-widest">Su bandeja está vacía</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-[#161b18] p-4 border border-gray-800 hover:border-[#c5a059]/30 transition">
                <div className="flex-1">
                  <h4 className="font-serif text-[#f0e6d2] text-lg">{item.nombre}</h4>
                  <p className="text-[#c5a059] text-sm">${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>
                </div>
                <div className="flex items-center border border-gray-700 bg-black rounded-sm">
                  <button onClick={() => restar(item.id)} className="px-3 py-1 text-gray-400 hover:text-white transition">-</button>
                  <span className="px-2 py-1 text-[#f0e6d2] text-sm font-mono">{item.cantidad}</span>
                  <button onClick={() => agregar(item)} className="px-3 py-1 text-gray-400 hover:text-white transition">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 bg-[#161b18] border-t border-[#c5a059]/20">
          <div className="flex justify-between items-end mb-6 font-serif border-b border-gray-800 pb-4">
            <span className="text-gray-400 text-sm uppercase tracking-widest">Total Estimado</span>
            <span className="text-3xl text-[#c5a059] font-bold">${total.toLocaleString('es-CL')}</span>
          </div>
          <form onSubmit={confirmarPedido} className="space-y-4">
            <input type="text" required placeholder="Nombre del Cliente" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-black border border-gray-700 text-[#f0e6d2] p-4 focus:border-[#c5a059] focus:outline-none placeholder-gray-600"/>
            <input type="tel" placeholder="Teléfono de Contacto" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full bg-black border border-gray-700 text-[#f0e6d2] p-4 focus:border-[#c5a059] focus:outline-none placeholder-gray-600"/>
            <button disabled={enviando || carrito.length === 0} className="w-full bg-[#c5a059] hover:bg-[#b08d48] text-[#062c16] font-bold py-4 uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {enviando ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}