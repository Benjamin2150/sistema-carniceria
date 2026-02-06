'use client';
import { useState, useEffect } from 'react';

export default function ReporteVentas() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    fetch('/api/ventas')
      .then(res => res.json())
      .then(data => setVentas(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📂 Historial de Ventas - Carnicería Escobar</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {ventas.map((venta) => (
          <div key={venta.id} className="border-b border-gray-200 p-6 hover:bg-gray-50 transition">
            
            {/* Cabecera de la Venta (Quién y Cuándo) */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-blue-800">{venta.cliente}</h2>
                <p className="text-sm text-gray-500">
                  📅 {new Date(venta.fecha).toLocaleDateString()} &nbsp;|&nbsp; 
                  🕒 {new Date(venta.fecha).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xs text-gray-500 uppercase">Total Pagado</span>
                <span className="text-2xl font-bold text-green-700">
                  ${venta.total.toLocaleString('es-CL')}
                </span>
              </div>
            </div>

            {/* Tabla de Detalles (Qué llevó) */}
            <div className="bg-gray-50 rounded p-3 border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2">Precio Unit.</th>
                    <th className="pb-2">Cantidad</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 font-medium text-gray-700">
                        {item.producto.nombre}
                      </td>
                      <td className="py-2">${item.precio.toLocaleString()}</td>
                      <td className="py-2">{item.cantidad} {item.producto.unidad}</td>
                      <td className="py-2 text-right font-bold">
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}

        {ventas.length === 0 && (
          <p className="p-8 text-center text-gray-500">No hay ventas registradas aún.</p>
        )}
      </div>
    </div>
  );
}