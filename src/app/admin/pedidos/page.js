'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [pedidos, setPedidos] = useState([]);
  // Por defecto, la fecha de hoy (formato YYYY-MM-DD para que coincida con el input)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toLocaleDateString('en-CA'));
  
  const cargarPedidos = () => {
    fetch('/api/pedidos')
      .then(res => res.json())
      .then(data => setPedidos(data));
  };

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const marcarComoVendido = async (id) => {
    if(!confirm("¿Confirmar entrega y pago?")) return;
    await fetch(`/api/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Entregado' })
    });
    cargarPedidos();
  };

  const eliminarPedido = async (id) => {
    if(!confirm("¿Borrar permanentemente?")) return;
    await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
    cargarPedidos();
  };

  // 1. Filtramos los PENDIENTES (Estos siempre se ven todos, no importa la fecha)
  const pendientes = pedidos.filter(p => p.estado === 'Pendiente');

  // 2. Filtramos las VENTAS (Solo las del día seleccionado en el calendario)
  const ventasDelDia = pedidos.filter(p => {
    if (p.estado !== 'Entregado') return false;
    // Cortamos la fecha del pedido (YYYY-MM-DDTHH:mm...) para quedarnos solo con YYYY-MM-DD
    const fechaPedido = p.fecha.split('T')[0];
    return fechaPedido === fechaSeleccionada;
  });

  // Calcular total del día seleccionado
  const totalDia = ventasDelDia.reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500 uppercase tracking-wider">Panel de Control</h1>
          <p className="text-gray-400 text-sm">Administración Carnicería Escobar</p>
        </div>
        
        {/* WIDGET DE CALENDARIO Y CAJA DIARIA */}
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold">Ventas del Día</p>
            <p className="text-2xl font-bold text-green-400">${totalDia.toLocaleString('es-CL')}</p>
          </div>
          <input 
            type="date" 
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="bg-gray-700 text-white border border-gray-500 rounded p-2 focus:outline-none focus:border-red-500 font-bold"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- COLUMNA 1: LO URGENTE (Pedidos Pendientes) --- */}
        <div className="bg-gray-800 rounded-xl p-5 border border-red-900/50 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400 border-b border-gray-700 pb-2">
            🔥 Pedidos por Preparar ({pendientes.length})
          </h2>
          
          {pendientes.length === 0 ? (
            <div className="text-center py-10 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
              <p className="text-gray-500 italic">Todo tranquilo por ahora...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendientes.map((p) => (
                <div key={p.id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-500 shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white">{p.nombreCliente}</h3>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {new Date(p.fecha).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})} hrs
                    </span>
                  </div>
                  
                  <ul className="text-sm text-gray-300 mb-4 bg-gray-800/50 p-2 rounded border border-gray-600">
                    {JSON.parse(p.detalle).map((item, i) => (
                      <li key={i} className="flex justify-between border-b border-gray-700 last:border-0 py-1">
                        <span>{item.nombre}</span>
                        <span className="text-gray-500">${item.precio}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center gap-3">
                    <button onClick={() => eliminarPedido(p.id)} className="text-red-400 hover:text-red-300 text-sm underline">
                      Cancelar
                    </button>
                    <button 
                      onClick={() => marcarComoVendido(p.id)}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold shadow transition-all"
                    >
                      COBRAR ${p.total.toLocaleString('es-CL')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUMNA 2: HISTORIAL DEL DÍA (Caja) --- */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2 border-b border-gray-700 pb-2">
            💰 Cierre de Caja: {fechaSeleccionada}
          </h2>
          
          {ventasDelDia.length === 0 ? (
             <p className="text-gray-500 text-center py-8">No hay ventas registradas en esta fecha.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 rounded-tl-lg">Hora</th>
                    <th className="px-3 py-3">Cliente</th>
                    <th className="px-3 py-3 text-right rounded-tr-lg">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasDelDia.map((v) => (
                    <tr key={v.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                      <td className="px-3 py-3 font-mono text-gray-500">
                        {new Date(v.fecha).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-3 py-3 font-medium text-white">{v.nombreCliente}</td>
                      <td className="px-3 py-3 text-right text-green-300 font-bold">
                        ${v.total.toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* TOTAL FINAL DE LA TABLA */}
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg flex justify-between items-center border border-gray-600">
                <span className="uppercase font-bold text-gray-400">Total Recaudado</span>
                <span className="text-2xl font-bold text-green-400">${totalDia.toLocaleString('es-CL')}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}