'use client';
import { useState, useEffect } from 'react';
import { obtenerProductos, obtenerPedidosAdmin, avanzarEstadoPedido, eliminarPedido, guardarProducto, eliminarProducto, obtenerEmpleados, guardarEmpleado, eliminarEmpleado, obtenerBalanzas, guardarBalanza, eliminarBalanza, sincronizarTodasLasPesas } from '../actions';

export default function AdminDashboard() {
  const [vista, setVista] = useState('pedidos'); 
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [balanzas, setBalanzas] = useState([]); // Nuevas Pesas
  
  // Estados de carga y modales
  const [sincronizando, setSincronizando] = useState(false);
  const [resultadoSync, setResultadoSync] = useState(null);
  const [editandoProd, setEditandoProd] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPersonal, setMostrarModalPersonal] = useState(false);
  const [mostrarModalPesa, setMostrarModalPesa] = useState(false);

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000); 
    return () => clearInterval(intervalo);
  }, []);

  async function cargarDatos() {
    const peds = await obtenerPedidosAdmin();
    const prods = await obtenerProductos();
    const staff = await obtenerEmpleados();
    const pesas = await obtenerBalanzas(); // Cargar IPs
    setPedidos(peds);
    setProductos(prods);
    setEmpleados(staff);
    setBalanzas(pesas);
  }

  const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;

  // --- MANEJADORES DE GUARDADO ---
  async function handleGuardar(e) {
    e.preventDefault();
    await guardarProducto(new FormData(e.target));
    setMostrarModal(false); cargarDatos();
  }
  async function handleGuardarEmpleado(e) {
    e.preventDefault();
    await guardarEmpleado(new FormData(e.target));
    setMostrarModalPersonal(false); cargarDatos();
  }
  async function handleGuardarPesa(e) {
    e.preventDefault();
    await guardarBalanza(new FormData(e.target));
    setMostrarModalPesa(false); cargarDatos();
  }

  // --- SINCRONIZACIÓN MÁGICA ---
  async function handleSync() {
    if(!confirm("¿Actualizar precios en las 7 balanzas?")) return;
    setSincronizando(true);
    setResultadoSync(null);
    try {
       const res = await sincronizarTodasLasPesas();
       setResultadoSync(res);
       alert("📡 Proceso terminado. Revisa el reporte.");
    } catch(e) {
       alert("Error general en la red.");
    }
    setSincronizando(false);
  }

  return (
    <div className="min-h-screen bg-[#0c120e] text-[#e2e8f0] font-sans selection:bg-amber-500 selection:text-black pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#063b1e]/95 backdrop-blur-md border-b border-[#c5a059]/30 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-full border-2 border-[#c5a059] overflow-hidden bg-black p-0.5">
                <img src="/logo.jpg" alt="Admin" className="w-full h-full object-cover rounded-full" />
             </div>
             <div className="hidden md:block">
                <h1 className="text-xl font-serif font-bold tracking-widest text-[#f0e6d2]">ADMINISTRACIÓN</h1>
             </div>
          </div>

          <div className="flex bg-[#000]/50 rounded-full p-1 border border-[#c5a059]/30 backdrop-blur-sm overflow-x-auto scrollbar-hide">
             <button onClick={() => setVista('pedidos')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'pedidos' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>🔔 Pedidos</span>
                {pendientes > 0 && <span className="bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">{pendientes}</span>}
             </button>
             <button onClick={() => setVista('inventario')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'inventario' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>🥩 Bodega</span>
             </button>
             <button onClick={() => setVista('personal')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'personal' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>👥 RRHH</span>
             </button>
             {/* NUEVA PESTAÑA RED */}
             <button onClick={() => setVista('red')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'red' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>📡 Red Pesas</span>
             </button>
          </div>
          <a href="/" className="hidden md:flex items-center gap-2 text-[#c5a059] border border-[#c5a059] px-4 py-2 rounded-sm text-xs font-bold uppercase hover:bg-[#c5a059] hover:text-black transition">Tienda ↗</a>
        </div>
      </nav>

      <div className="pt-32 max-w-6xl mx-auto px-4 w-full">
        
        {/* VISTA PEDIDOS (RESUMIDA PARA NO REPETIR CODIGO LARGO) */}
        {vista === 'pedidos' && (
           <div className="space-y-6">
              {pedidos.map(p => (
                <div key={p.id} className="bg-[#161b18] border border-[#c5a059]/30 p-6 rounded-lg flex justify-between items-center mb-4">
                     <div><h3 className="text-xl font-serif text-[#f0e6d2]">{p.nombreCliente}</h3><p className="text-gray-400">{p.estado}</p></div>
                     <button onClick={() => avanzarEstadoPedido(p.id, p.estado)} className="bg-[#c5a059] text-black font-bold p-2 rounded text-xs">Avanzar</button>
                </div>
              ))}
              {pedidos.length === 0 && <p className="text-center opacity-50">Sin pedidos pendientes</p>}
           </div>
        )}

        {/* VISTA INVENTARIO */}
        {vista === 'inventario' && (
           <div>
              <div className="flex justify-between mb-8">
                 <h2 className="text-3xl font-serif text-[#f0e6d2]">Bodega</h2>
                 <button onClick={() => { setEditandoProd(null); setMostrarModal(true); }} className="bg-[#c5a059] text-black px-4 py-2 rounded font-bold uppercase">+ Nuevo</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {productos.map(p => (
                    <div key={p.id} className="bg-[#161b18] p-4 border border-gray-800 rounded">
                       <p className="text-white font-bold">{p.nombre}</p>
                       <p className="text-[#c5a059]">${p.precio}</p>
                       <button onClick={() => { setEditandoProd(p); setMostrarModal(true); }} className="text-xs text-gray-500 underline">Editar</button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* VISTA PERSONAL */}
        {vista === 'personal' && (
           <div>
              <div className="flex justify-between mb-8">
                 <h2 className="text-3xl font-serif text-[#f0e6d2]">Personal</h2>
                 <button onClick={() => setMostrarModalPersonal(true)} className="bg-[#c5a059] text-black px-4 py-2 rounded font-bold uppercase">+ Contratar</button>
              </div>
              <div className="grid gap-4">
                 {empleados.map(e => (
                    <div key={e.id} className="bg-[#161b18] p-4 flex justify-between border border-gray-800">
                       <span className="text-white">{e.nombre} ({e.cargo})</span>
                       <button onClick={() => eliminarEmpleado(e.id)} className="text-red-500">✕</button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* --- VISTA RED PESAS (NUEVA) --- */}
        {vista === 'red' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LISTA DE MÁQUINAS */}
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-serif text-[#f0e6d2]">Máquinas Conectadas</h2>
                    <button onClick={() => setMostrarModalPesa(true)} className="bg-[#c5a059] text-black px-4 py-2 rounded-sm text-xs font-bold uppercase">+ Agregar IP</button>
                 </div>
                 
                 <div className="space-y-3">
                    {balanzas.map(b => (
                       <div key={b.id} className="bg-[#161b18] border border-gray-800 p-4 rounded flex justify-between items-center group hover:border-[#c5a059]/50 transition">
                          <div className="flex items-center gap-3">
                             <span className="text-2xl">⚖️</span>
                             <div>
                                <h3 className="font-bold text-white">{b.nombre}</h3>
                                <p className="text-[#c5a059] font-mono text-sm">{b.ip}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] text-gray-500 uppercase">Online</span>
                             </div>
                             <button onClick={() => eliminarBalanza(b.id)} className="text-red-900 hover:text-red-500">✕</button>
                          </div>
                       </div>
                    ))}
                    {balanzas.length === 0 && <p className="text-gray-500 text-center py-4 border border-dashed border-gray-800">No hay balanzas configuradas.</p>}
                 </div>
              </div>

              {/* PANEL DE CONTROL DE SINCRONIZACIÓN */}
              <div className="bg-[#111] border border-[#c5a059] p-8 rounded-sm shadow-[0_0_30px_rgba(197,160,89,0.1)] flex flex-col justify-center items-center text-center">
                 <div className="mb-6">
                    <span className="text-6xl mb-2 block">📡</span>
                    <h3 className="text-2xl font-serif text-[#f0e6d2] mb-2">Sincronización Total</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                       Se enviarán {productos.length} productos con sus precios actuales a las {balanzas.length} balanzas configuradas.
                    </p>
                 </div>

                 <button 
                    onClick={handleSync} 
                    disabled={sincronizando || balanzas.length === 0}
                    className="w-full bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold py-5 rounded-sm uppercase tracking-[0.2em] shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                 >
                    {sincronizando ? (
                       <>
                          <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ENVIANDO...
                       </>
                    ) : 'INICIAR ACTUALIZACIÓN'}
                 </button>

                 {/* REPORTE DE RESULTADOS */}
                 {resultadoSync && (
                    <div className="mt-6 w-full text-left bg-black p-4 rounded border border-gray-800 max-h-40 overflow-y-auto">
                       <h4 className="text-[10px] uppercase text-gray-500 mb-2 border-b border-gray-800 pb-1">Reporte de Conexión</h4>
                       <ul className="space-y-1 text-xs font-mono">
                          {resultadoSync.map((r, i) => (
                             <li key={i} className="flex justify-between">
                                <span>{r.nombre}</span>
                                <span>{r.status}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 )}
              </div>
           </div>
        )}

      </div>

      {/* MODAL AGREGAR PESA */}
      {mostrarModalPesa && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111] border border-[#c5a059] p-8 rounded-sm max-w-sm w-full animate-in zoom-in-95">
               <button onClick={() => setMostrarModalPesa(false)} className="absolute top-4 right-4 text-white">✕</button>
               <h2 className="text-xl text-[#c5a059] mb-4 text-center">Nueva Balanza DIGI</h2>
               <form onSubmit={handleGuardarPesa} className="space-y-4">
                  <div>
                     <label className="text-[10px] uppercase text-gray-500">Nombre (Ubicación)</label>
                     <input name="nombre" placeholder="Ej: Pasillo Central" required className="w-full bg-[#0c120e] border border-gray-700 p-3 text-white focus:border-[#c5a059] outline-none"/>
                  </div>
                  <div>
                     <label className="text-[10px] uppercase text-gray-500">Dirección IP</label>
                     <input name="ip" placeholder="Ej: 192.168.1.50" required className="w-full bg-[#0c120e] border border-gray-700 p-3 text-white font-mono focus:border-[#c5a059] outline-none"/>
                  </div>
                  <button className="w-full bg-[#c5a059] text-black font-bold p-3 uppercase tracking-widest mt-2">Conectar</button>
               </form>
            </div>
         </div>
      )}

      {/* LOS OTROS MODALES (PRODUCTO Y PERSONAL) LOS MANTENEMOS IGUAL QUE ANTES... */}
      {/* ... (Aquí irían los modales que ya tenías, no los borres) ... */}
      
      {/* --- MODAL PRODUCTO (RESUMIDO) --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#111] border border-[#c5a059] p-8 rounded-sm max-w-md w-full relative">
              <button onClick={() => setMostrarModal(false)} className="absolute top-4 right-4 text-white">✕</button>
              <h2 className="text-xl text-[#c5a059] mb-4">Gestión Producto</h2>
              <form onSubmit={handleGuardar} className="space-y-4" encType="multipart/form-data">
                 <input type="hidden" name="id" value={editandoProd?.id || ''} />
                 <input name="nombre" defaultValue={editandoProd?.nombre} placeholder="Nombre" className="w-full bg-black border border-gray-700 p-2 text-white" required/>
                 <div className="grid grid-cols-2 gap-2">
                    <input name="precio" type="number" defaultValue={editandoProd?.precio} placeholder="Precio" className="w-full bg-black border border-gray-700 p-2 text-white" required/>
                    <select name="categoria" defaultValue={editandoProd?.categoria} className="w-full bg-black border border-gray-700 p-2 text-white"><option value="Parrilla">Parrilla</option><option value="Olla">Olla</option><option value="Diario">Diario</option></select>
                 </div>
                 <input type="file" name="imagen" accept="image/*" className="text-white text-xs"/>
                 <button className="w-full bg-[#c5a059] text-black font-bold p-3">GUARDAR</button>
              </form>
           </div>
        </div>
      )}

      {/* --- MODAL PERSONAL (RESUMIDO) --- */}
      {mostrarModalPersonal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#111] border border-[#c5a059] p-8 rounded-sm max-w-md w-full relative">
              <button onClick={() => setMostrarModalPersonal(false)} className="absolute top-4 right-4 text-white">✕</button>
              <h2 className="text-xl text-[#c5a059] mb-4">Nuevo Empleado</h2>
              <form onSubmit={handleGuardarEmpleado} className="space-y-4">
                 <input name="nombre" placeholder="Nombre" required className="w-full bg-black border border-gray-700 p-2 text-white"/>
                 <input name="cargo" placeholder="Cargo" required className="w-full bg-black border border-gray-700 p-2 text-white"/>
                 <input name="tipoContrato" placeholder="Contrato" required className="w-full bg-black border border-gray-700 p-2 text-white"/>
                 <input name="sueldoBase" type="number" placeholder="Sueldo Base" required className="w-full bg-black border border-gray-700 p-2 text-white"/>
                 <button className="w-full bg-[#c5a059] text-black font-bold p-3">CONTRATAR</button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}