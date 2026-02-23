'use client';
import { useState, useEffect } from 'react';
import { obtenerProductos, obtenerPedidosAdmin, obtenerHistorialPedidos, avanzarEstadoPedido, eliminarPedido, guardarProducto, eliminarProducto, obtenerEmpleados, guardarEmpleado, eliminarEmpleado, obtenerBalanzas, guardarBalanza, eliminarBalanza, sincronizarTodasLasPesas } from '../actions';

export default function AdminDashboard() {
  const [vista, setVista] = useState('pedidos'); 
  const [pedidos, setPedidos] = useState([]);
  const [historial, setHistorial] = useState([]); // Nuevo estado para el historial
  const [productos, setProductos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [balanzas, setBalanzas] = useState([]); 
  
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
    const hist = await obtenerHistorialPedidos(); // Cargamos las ventas cobradas
    const prods = await obtenerProductos();
    const staff = await obtenerEmpleados();
    const pesas = await obtenerBalanzas(); 
    
    setPedidos(peds);
    setHistorial(hist);
    setProductos(prods);
    setEmpleados(staff);
    setBalanzas(pesas);
  }

  const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;

  // Manejadores de Guardado
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

  async function handleSync() {
    if(!confirm("¿Actualizar precios en las balanzas?")) return;
    setSincronizando(true); setResultadoSync(null);
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
             {/* NUEVO BOTÓN HISTORIAL */}
             <button onClick={() => setVista('historial')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'historial' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>🧾 Historial</span>
             </button>
             <button onClick={() => setVista('inventario')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'inventario' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>🥩 Bodega</span>
             </button>
             <button onClick={() => setVista('personal')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'personal' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>👥 RRHH</span>
             </button>
             <button onClick={() => setVista('red')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vista === 'red' ? 'bg-[#c5a059] text-[#062c16] shadow-lg' : 'text-gray-400 hover:text-[#f0e6d2]'}`}>
                <span>📡 Red Pesas</span>
             </button>
          </div>
          <a href="/" className="hidden md:flex items-center gap-2 text-[#c5a059] border border-[#c5a059] px-4 py-2 rounded-sm text-xs font-bold uppercase hover:bg-[#c5a059] hover:text-black transition">Tienda ↗</a>
        </div>
      </nav>

      <div className="pt-32 max-w-6xl mx-auto px-4 w-full">
        
        {/* VISTA PEDIDOS DETALLADA */}
        {vista === 'pedidos' && (
           <div className="space-y-6">
              <div className="text-center mb-10">
                 <h2 className="text-3xl font-serif text-[#f0e6d2] mb-2">Comandas Activas</h2>
              </div>
              
              {pedidos.length === 0 ? (
                 <div className="text-center py-20 opacity-50 border-2 border-dashed border-[#333] rounded-lg">
                    <p className="text-6xl mb-4">🍂</p>
                    <p className="text-xl font-serif">Todo limpio por ahora</p>
                 </div>
              ) : (
                 pedidos.map(p => (
                    <div key={p.id} className="relative bg-[#161b18] border border-[#c5a059]/30 p-6 rounded-lg shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
                          <div className="flex-1 text-center md:text-left">
                             <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="text-[#c5a059] text-xs font-bold border border-[#c5a059] px-2 py-1 rounded-sm uppercase">
                                   {p.estado}
                                </span>
                             </div>
                             <h3 className="text-2xl font-serif text-[#f0e6d2]">{p.nombreCliente}</h3>
                             <p className="text-sm text-gray-400 mt-1">📞 {p.telefono || 'Sin teléfono'}</p>
                          </div>
                          <div className="flex-[2] w-full border-t md:border-t-0 md:border-l border-[#c5a059]/20 md:pl-6 pt-4 md:pt-0">
                             <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Detalle de la compra:</h4>
                             <ul className="space-y-2">
                                {p.items.map((item, i) => (
                                   <li key={i} className="flex justify-between text-sm text-[#e2e8f0]">
                                      <span className="font-bold text-[#c5a059]">{item.cantidad} x</span>
                                      <span className="flex-1 mx-2 border-b border-dotted border-gray-700 relative top-[-4px]"></span>
                                      <span>{item.producto?.nombre || 'Producto eliminado'}</span>
                                      <span className="ml-4 text-gray-400">${item.subtotal.toLocaleString('es-CL')}</span>
                                   </li>
                                ))}
                             </ul>
                             <div className="mt-4 text-right text-xl font-serif text-[#c5a059] border-t border-gray-800 pt-2">
                                Total: ${p.total.toLocaleString('es-CL')}
                             </div>
                          </div>
                          <div className="flex flex-col gap-3 w-full md:w-auto min-w-[150px]">
                             <button onClick={() => avanzarEstadoPedido(p.id, p.estado)} className="bg-[#c5a059] hover:bg-[#b08d48] text-[#062c16] font-bold py-3 px-4 rounded-sm uppercase text-xs tracking-widest shadow-lg transition-transform">
                                {p.estado === 'PENDIENTE' ? 'Confirmar' : p.estado === 'PREPARACION' ? 'Terminar' : 'Cobrar'}
                             </button>
                             {p.estado === 'PENDIENTE' && (
                                <button onClick={() => { if(confirm('¿Rechazar pedido?')) eliminarPedido(p.id) }} className="px-4 py-2 border border-red-900 text-red-700 hover:bg-red-900 hover:text-white rounded-sm text-xs font-bold uppercase transition">Cancelar</button>
                             )}
                          </div>
                    </div>
                 ))
              )}
           </div>
        )}

        {/* --- NUEVA VISTA: HISTORIAL DE VENTAS COBRADAS --- */}
        {vista === 'historial' && (
           <div className="space-y-6">
              <div className="flex justify-between items-end mb-10 border-b border-[#c5a059]/20 pb-4">
                 <div>
                    <h2 className="text-3xl font-serif text-[#f0e6d2]">Historial de Ventas</h2>
                    <p className="text-[#c5a059] text-sm uppercase tracking-[0.2em] mt-2">Dinero ingresado a caja</p>
                 </div>
              </div>
              
              {historial.length === 0 ? (
                 <div className="text-center py-20 opacity-50 border-2 border-dashed border-[#333] rounded-lg">
                    <p className="text-6xl mb-4">🧾</p>
                    <p className="text-xl font-serif">Aún no hay ventas cobradas</p>
                 </div>
              ) : (
                 <div className="grid gap-4">
                    {historial.map(p => {
                       const fechaObj = new Date(p.fecha);
                       const fechaFormateada = fechaObj.toLocaleDateString('es-CL');
                       const horaFormateada = fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                       
                       return (
                       <div key={p.id} className="bg-[#111] border border-gray-800 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center opacity-90 hover:opacity-100 transition shadow-lg">
                          <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="text-green-500 text-[10px] font-bold border border-green-500/30 bg-green-500/10 px-2 py-1 rounded-sm uppercase">✅ Cobrado</span>
                                <span className="text-gray-400 text-sm font-mono tracking-wider">📅 {fechaFormateada} &nbsp; ⏰ {horaFormateada}</span>
                             </div>
                             <h3 className="text-xl font-serif text-[#f0e6d2]">{p.nombreCliente}</h3>
                             
                             <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-2">
                                {p.items.map((item, i) => (
                                   <span key={i} className="bg-black border border-gray-800 px-2 py-1 rounded">
                                      <span className="text-[#c5a059]">{item.cantidad}x</span> {item.producto?.nombre}
                                   </span>
                                ))}
                             </div>
                          </div>
                          
                          <div className="text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 pl-0 md:pl-6">
                             <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Total Pagado</p>
                             <p className="text-3xl font-serif text-[#c5a059]">${p.total.toLocaleString('es-CL')}</p>
                          </div>
                       </div>
                    )})}
                 </div>
              )}
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
                       <button onClick={() => { setEditandoProd(p); setMostrarModal(true); }} className="text-xs text-gray-500 underline mt-2 block">Editar</button>
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
                    <div key={e.id} className="bg-[#161b18] p-4 flex justify-between border border-gray-800 rounded">
                       <span className="text-white">{e.nombre} ({e.cargo})</span>
                       <button onClick={() => eliminarEmpleado(e.id)} className="text-red-500">✕</button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* VISTA RED PESAS */}
        {vista === 'red' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-serif text-[#f0e6d2]">Máquinas</h2>
                    <button onClick={() => setMostrarModalPesa(true)} className="bg-[#c5a059] text-black px-4 py-2 rounded-sm text-xs font-bold uppercase">+ IP</button>
                 </div>
                 <div className="space-y-3">
                    {balanzas.map(b => (
                       <div key={b.id} className="bg-[#161b18] border border-gray-800 p-4 rounded flex justify-between items-center group">
                          <div>
                             <h3 className="font-bold text-white">⚖️ {b.nombre}</h3>
                             <p className="text-[#c5a059] font-mono text-sm ml-6">{b.ip}</p>
                          </div>
                          <button onClick={() => eliminarBalanza(b.id)} className="text-red-900 hover:text-red-500">✕</button>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-[#111] border border-[#c5a059] p-8 rounded-sm text-center">
                 <span className="text-6xl mb-2 block">📡</span>
                 <h3 className="text-2xl font-serif text-[#f0e6d2] mb-4">Sincronización Total</h3>
                 <button onClick={handleSync} disabled={sincronizando} className="w-full bg-[#c5a059] text-black font-bold py-4 uppercase">
                    {sincronizando ? 'ENVIANDO...' : 'INICIAR ACTUALIZACIÓN'}
                 </button>
              </div>
           </div>
        )}

      </div>

      {/* --- MODALES OMITIDOS PARA NO HACER EL CÓDIGO GIGANTE, SON LOS MISMOS QUE YA TIENES --- */}
      {/* (PRODUCTOS, PERSONAL, PESA) */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
           <div className="bg-[#111] border border-[#c5a059] p-8 rounded max-w-md w-full relative">
              <button onClick={() => setMostrarModal(false)} className="absolute top-4 right-4 text-white">✕</button>
              <h2 className="text-xl text-[#c5a059] mb-4">Gestión Producto</h2>
              <form onSubmit={handleGuardar} className="space-y-4" encType="multipart/form-data">
                 <input type="hidden" name="id" value={editandoProd?.id || ''} />
                 <input name="nombre" defaultValue={editandoProd?.nombre} placeholder="Nombre" className="w-full bg-black border border-gray-700 p-2 text-white" required/>
                 <input name="precio" type="number" defaultValue={editandoProd?.precio} placeholder="Precio" className="w-full bg-black border border-gray-700 p-2 text-white" required/>
                 <select name="categoria" defaultValue={editandoProd?.categoria} className="w-full bg-black border border-gray-700 p-2 text-white"><option value="Parrilla">Parrilla</option><option value="Olla">Olla</option><option value="Diario">Diario</option></select>
                 <input type="file" name="imagen" accept="image/*" className="text-white text-xs"/>
                 <button className="w-full bg-[#c5a059] text-black font-bold p-3">GUARDAR</button>
              </form>
           </div>
        </div>
      )}

      {mostrarModalPersonal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
           <div className="bg-[#111] border border-[#c5a059] p-8 rounded max-w-md w-full relative">
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

      {mostrarModalPesa && (
         <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111] border border-[#c5a059] p-8 rounded max-w-sm w-full relative">
               <button onClick={() => setMostrarModalPesa(false)} className="absolute top-4 right-4 text-white">✕</button>
               <h2 className="text-xl text-[#c5a059] mb-4">Nueva Balanza DIGI</h2>
               <form onSubmit={handleGuardarPesa} className="space-y-4">
                  <input name="nombre" placeholder="Ej: Pasillo Central" required className="w-full bg-black border border-gray-700 p-2 text-white"/>
                  <input name="ip" placeholder="Ej: 192.168.1.50" required className="w-full bg-black border border-gray-700 p-2 text-white font-mono"/>
                  <button className="w-full bg-[#c5a059] text-black font-bold p-3">Conectar</button>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}