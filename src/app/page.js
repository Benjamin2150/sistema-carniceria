'use client';
import { useState, useEffect } from 'react';
import { obtenerProductos, crearPedido } from './actions';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  
  // NUEVO: Estados para manejar el texto libre (número) y la unidad (kg o gr)
  const [cantidades, setCantidades] = useState({});
  const [unidades, setUnidades] = useState({});
  
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

  // Función matemática para convertir lo que escriben a Kilos reales
  const getPesoCalculado = (id) => {
    const valTexto = cantidades[id];
    // Si no escriben nada, asumimos 1 por defecto para que no de error
    const valNum = parseFloat(valTexto);
    if (isNaN(valNum) || valNum <= 0) return 1; 

    const unidad = unidades[id] || 'kg';
    return unidad === 'gr' ? valNum / 1000 : valNum;
  };

  // --- LÓGICA DE CARRITO ---
  const agregar = (p, pesoElegido) => {
    const existe = carrito.find(item => item.id === p.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === p.id ? {...item, cantidad: item.cantidad + pesoElegido} : item));
    } else {
      setCarrito([...carrito, { ...p, cantidad: pesoElegido }]);
    }
    setCarritoAbierto(true);
    
    // Limpiamos el input después de agregar
    setCantidades({...cantidades, [p.id]: ""});
  };

  const sumarCart = (id) => {
    // Suma 100 gramos (0.1 kg) redondeando para evitar errores de decimales
    setCarrito(carrito.map(item => item.id === id ? {...item, cantidad: Math.round((item.cantidad + 0.1) * 1000) / 1000} : item));
  };

  const restar = (id) => {
    // Resta 100 gramos (0.1 kg)
    const existe = carrito.find(item => item.id === id);
    if (existe.cantidad > 0.1) {
      setCarrito(carrito.map(item => item.id === id ? {...item, cantidad: Math.round((item.cantidad - 0.1) * 1000) / 1000} : item));
    } else {
      setCarrito(carrito.filter(item => item.id !== id));
    }
  };

  const formatearPeso = (cant) => {
    if (cant < 1) return `${Math.round(cant * 1000)} gr`;
    // Si es un número entero (ej: 2) muestra 2 Kg, si tiene decimal (ej 1.5) muestra 1.5 Kg
    return `${Number.isInteger(cant) ? cant : cant.toFixed(2).replace(/\.00$/, '')} Kg`;
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
      
      {/* --- NAVBAR --- */}
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
              {carrito.length}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productosVisibles.map((p) => {
            const pesoCalculado = getPesoCalculado(p.id);
            const precioAproximado = p.precio * pesoCalculado;

            return (
            <div key={p.id} className="group bg-[#161b18] border border-gray-800 hover:border-[#c5a059]/50 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#c5a059]/10 overflow-hidden relative rounded-sm flex flex-col">
              <div className="relative h-56 overflow-hidden bg-[#0a0f0c] border-b border-[#c5a059]/10">
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#2a352f] group-hover:text-[#c5a059]/30 transition">
                    <span className="text-[10px] tracking-[0.3em] uppercase">Sin Imagen</span>
                  </div>
                )}
                {p.plu && <div className="absolute top-0 right-0 bg-[#c5a059] text-[#062c16] text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-lg">#{p.plu}</div>}
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-xl font-serif text-[#f0e6d2] mb-1 group-hover:text-[#c5a059] transition">{p.nombre}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{p.categoria}</p>
                </div>
                
                <div className="mt-auto border-t border-gray-800 pt-4">
                  <div className="flex justify-between items-end mb-4">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Valor Kilo</span>
                    <span className="text-xl font-serif text-[#c5a059] font-medium">${p.precio.toLocaleString('es-CL')}</span>
                  </div>

                  {/* --- NUEVO INPUT LIBRE --- */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min="0"
                        step="any"
                        placeholder="Ej: 300"
                        className="w-2/3 bg-[#0c120e] border border-[#c5a059]/50 text-[#f0e6d2] p-2 rounded-sm text-sm focus:outline-none focus:border-[#c5a059]"
                        value={cantidades[p.id] !== undefined ? cantidades[p.id] : ""}
                        onChange={(e) => setCantidades({...cantidades, [p.id]: e.target.value})}
                      />
                      <select 
                        className="w-1/3 bg-[#0c120e] border border-[#c5a059]/50 text-[#f0e6d2] p-2 rounded-sm text-sm focus:outline-none focus:border-[#c5a059] cursor-pointer"
                        value={unidades[p.id] || "gr"}
                        onChange={(e) => setUnidades({...unidades, [p.id]: e.target.value})}
                      >
                        <option value="gr">Gr</option>
                        <option value="kg">Kg</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => agregar(p, pesoCalculado)} 
                      className="w-full bg-[#161b18] border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#062c16] px-4 py-2 text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded-sm flex justify-between items-center"
                    >
                      <span>Añadir</span>
                      <span>Aprox ${(precioAproximado).toLocaleString('es-CL')}</span>
                    </button>
                    <p className="text-[9px] text-gray-500 text-center leading-tight tracking-wider">
                      *VALOR APROXIMADO. SE PESARÁ EN LOCAL.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#050806] border-t border-[#c5a059]/20 mt-20 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
           <div>
              <h3 className="text-3xl font-serif text-[#c5a059] mb-8">Nuestra Carnicería</h3>
              <div className="flex flex-col items-center mt-4">
  {/* Texto de la ubicación para que sea visual */}
  <p className="text-gray-700 font-semibold mb-2">
    📍 Visítanos en: Bustamante 157, Valparaíso
  </p>
              </div>
           </div>
        </div>
        <div className="flex justify-between items-center text-gray-600 text-xs mt-16 pt-8 border-t border-[#111] max-w-7xl mx-auto">
            <span className="uppercase tracking-widest">© 2026 Carnicería Escobar</span>
            <a href="/admin/login" className="flex items-center gap-2 hover:text-[#c5a059] transition">Acceso Personal</a>
        </div>
      </footer>

      {/* --- SIDEBAR CARRITO --- */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#0c120e] shadow-2xl transform transition-transform duration-500 z-[60] border-l border-[#c5a059]/20 flex flex-col ${carritoAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-[#c5a059]/20 flex justify-between items-center bg-[#080c09]">
          <h2 className="text-2xl font-serif text-[#c5a059] flex items-center gap-3">
            <span>🛒</span> Su Comanda
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
              <div key={item.id} className="flex flex-col gap-3 bg-[#161b18] p-4 border border-gray-800 hover:border-[#c5a059]/30 transition rounded-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-[#f0e6d2] text-lg">{item.nombre}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Aprox ${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>
                  </div>
                  <div className="flex items-center border border-[#c5a059]/50 bg-[#0a0f0c] rounded-sm">
                    {/* Botones + y - suman o restan de a 100 gramos para que sea preciso */}
                    <button onClick={() => restar(item.id)} className="px-3 py-1 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition">-</button>
                    <span className="px-3 py-1 text-[#f0e6d2] text-xs font-mono font-bold bg-black">{formatearPeso(item.cantidad)}</span>
                    <button onClick={() => sumarCart(item.id)} className="px-3 py-1 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition">+</button>
                  </div>
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
          <p className="text-[9px] text-gray-500 mb-4 text-center uppercase tracking-widest">*Valores referenciales. Se cobrará peso exacto en local.</p>
          <form onSubmit={confirmarPedido} className="space-y-4">
            <input type="text" required placeholder="Nombre del Cliente" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-black border border-gray-700 text-[#f0e6d2] p-4 focus:border-[#c5a059] focus:outline-none placeholder-gray-600 rounded-sm"/>
            <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full bg-black border border-gray-700 text-[#f0e6d2] p-4 focus:border-[#c5a059] focus:outline-none placeholder-gray-600 rounded-sm"/>
            <button disabled={enviando || carrito.length === 0} className="w-full bg-[#c5a059] hover:bg-[#b08d48] text-[#062c16] font-bold py-4 uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg rounded-sm">
              {enviando ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}