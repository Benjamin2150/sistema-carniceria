'use client';
import { useState, useEffect } from 'react';
import { obtenerProductos, crearPedido } from './actions';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  
  // Estados para manejar el texto libre (número) y la unidad (kg o gr)
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

  // --- LÓGICA PARA EXPORTAR A LAS PESAS DIGI (LABELNET) ---
  const descargarTXT = () => {
    if (productos.length === 0) {
      alert("No hay productos cargados en la base de datos.");
      return;
    }
    
    let contenido = "";
    // Iteramos sobre todos los productos para armar el formato exacto de LabelNet
    productos.forEach(p => {
      // Si no tiene PLU, usamos su ID por defecto para que no falle
      const numeroPlu = p.plu || p.id; 
      // Formato: PLU_No (tab) PLU_EANItemCode (tab) Nombre (tab) Precio Unitario
      contenido += `${numeroPlu}\t${numeroPlu}\t${p.nombre}\t${p.precio}\n`;
    });

    // Creamos el archivo y forzamos la descarga en el navegador
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'precios_labelnet.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Obtener lista de categorías únicas de la base de datos
  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];

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

      {/* --- CATÁLOGO ORDENADO POR CATEGORÍAS --- */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Botones de Filtro Superiores */}
        <div className="flex justify-center flex-wrap gap-4 mb-16">
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

        {/* Mapeo de Categorías y sus Productos */}
        {categorias.filter(c => c !== "Todos" && (filtro === "Todos" || filtro === c)).map(categoriaActual => {
          
          // Filtramos los productos que pertenecen a esta categoría Y coinciden con la búsqueda
          const productosDeEstaCategoria = productos.filter(p => 
            p.categoria === categoriaActual && 
            p.nombre.toLowerCase().includes(busqueda.toLowerCase())
          );

          // Si la categoría está vacía por la búsqueda, no la mostramos
          if (productosDeEstaCategoria.length === 0) return null;

          return (
            <div key={categoriaActual} className="mb-20">
              {/* Título de la Categoría */}
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-serif text-[#c5a059] uppercase tracking-widest">{categoriaActual}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-[#c5a059]/50 to-transparent"></div>
              </div>

              {/* Grilla de productos de ESTA categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {productosDeEstaCategoria.map((p) => {
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
                        {p.plu && <div className="absolute top-0 right-0 bg-[#c5a059] text-[#062c16] text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-lg">PLU #{p.plu}</div>}
                      </div>
                      
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-4">
                          <h3 className="text-xl font-serif text-[#f0e6d2] mb-1 group-hover:text-[#c5a059] transition">{p.nombre}</h3>
                        </div>
                        
                        <div className="mt-auto border-t border-gray-800 pt-4">
                          <div className="flex justify-between items-end mb-4">
                            <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Valor Kilo</span>
                            <span className="text-xl font-serif text-[#c5a059] font-medium">${p.precio.toLocaleString('es-CL')}</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input 
                                type="number" min="0" step="any" placeholder="Ej: 300"
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- FOOTER CON MAPA Y HERRAMIENTAS --- */}
      <footer className="bg-[#050806] border-t border-[#c5a059]/20 mt-20 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
           
           {/* Información y WhatsApp */}
           <div>
              <h3 className="text-3xl font-serif text-[#c5a059] mb-4">Carnes Escobar</h3>
              <p className="text-gray-400 font-semibold mb-6 flex items-center gap-2">
                📍 Bustamante 157, Valparaíso
              </p>
              
              <a 
                href="https://wa.me/56984293570?text=Hola,%20vengo%20de%20la%20página%20web" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Hablar con Local
              </a>
           </div>

           {/* Mapa de Google */}
           <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-[#c5a059]/20 shadow-xl">
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3344.425950587742!2d-71.61625922361664!3d-33.04526547631722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9689e12f6a7fc87d%3A0x673c68c6a086055d!2sBustamante%20157%2C%202340000%20Valpara%C3%ADso!5e0!3m2!1ses-419!2scl!4v1708815234567!5m2!1ses-419!2scl" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen="" 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade">
             </iframe>
           </div>
        </div>

        {/* Botonera de Administración y Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs mt-16 pt-8 border-t border-[#111] max-w-7xl mx-auto gap-4">
            <span className="uppercase tracking-widest">© 2026 Carnicería Escobar</span>
            
            <div className="flex gap-6">
              {/* Botón para descargar el TXT para el LabelNet */}
              <button 
                onClick={descargarTXT}
                className="flex items-center gap-2 text-[#c5a059] hover:text-white transition bg-[#161b18] px-4 py-2 rounded-sm border border-[#c5a059]/30"
              >
                ⬇️ Exportar TXT Pesas
              </button>
              
              <a href="/admin/login" className="flex items-center gap-2 hover:text-[#c5a059] transition py-2">
                🔒 Acceso Personal
              </a>
            </div>
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