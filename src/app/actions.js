'use server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as ftp from 'basic-ftp';

const prisma = new PrismaClient();

// ==========================================
// 1. ZONA PÚBLICA (TIENDA CLIENTES)
// ==========================================

export async function obtenerProductos() {
  return await prisma.producto.findMany({
    where: { disponible: true },
    orderBy: { nombre: 'asc' }
  });
}

export async function crearPedido(datos) {
  try {
    const pedido = await prisma.pedido.create({
      data: {
        nombreCliente: datos.nombreCliente,
        telefono: datos.telefono,
        total: datos.total,
        estado: 'PENDIENTE',
        items: {
          create: datos.carrito.map(item => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.precio * item.cantidad
          }))
        }
      }
    });
    revalidatePath('/admin');
    return { success: true, id: pedido.id };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

// ==========================================
// 2. ZONA ADMIN (SEGURIDAD Y PEDIDOS)
// ==========================================

export async function login(formData) {
  const user = await prisma.usuario.findUnique({
    where: { username: formData.get('username') }
  });

  if (user && user.password === formData.get('password')) {
    const cookieStore = await cookies(); 
    cookieStore.set('admin_session', 'true', { secure: false });
    return { success: true };
  }
  return { success: false };
}
export async function obtenerHistorialPedidos() {
  return await prisma.pedido.findMany({
    where: { estado: 'ENTREGADO' }, // Solo trae los que ya se cobraron
    orderBy: { fecha: 'desc' }, // Los ordena del más nuevo al más viejo
    include: { items: { include: { producto: true } } }
  });
}

export async function obtenerPedidosAdmin() {
  return await prisma.pedido.findMany({
    where: { NOT: { estado: 'ENTREGADO' } },
    orderBy: { fecha: 'asc' },
    include: { items: { include: { producto: true } } }
  });
}

export async function avanzarEstadoPedido(id, estadoActual) {
  let nuevoEstado = '';
  if (estadoActual === 'PENDIENTE') nuevoEstado = 'PREPARACION';
  else if (estadoActual === 'PREPARACION') nuevoEstado = 'LISTO';
  else if (estadoActual === 'LISTO') nuevoEstado = 'ENTREGADO';

  if (nuevoEstado) {
    await prisma.pedido.update({
      where: { id },
      data: { estado: nuevoEstado }
    });
    revalidatePath('/admin');
  }
}

export async function eliminarPedido(id) {
    await prisma.pedido.delete({ where: { id } });
    revalidatePath('/admin');
}

// ==========================================
// 3. GESTIÓN DE PRODUCTOS (FOTOS E INVENTARIO)
// ==========================================

export async function guardarProducto(formData) {
  const id = formData.get('id');
  const nombre = formData.get('nombre').toUpperCase();
  const precio = parseInt(formData.get('precio'));
  const categoria = formData.get('categoria');
  const archivo = formData.get('imagen'); 
  
  // Manejo de la Imagen
  let rutaImagen = null;
  if (archivo && archivo.size > 0) {
    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

    const nombreArchivo = `${Date.now()}-${archivo.name.replace(/\s/g, '-')}`;
    const rutaCompleta = join(uploadDir, nombreArchivo);
    
    await writeFile(rutaCompleta, buffer);
    rutaImagen = `/uploads/${nombreArchivo}`;
  }

  // PLU Automático
  let plu = parseInt(formData.get('plu') || 0);
  if (plu === 0) {
     const ultimo = await prisma.producto.findFirst({ orderBy: { plu: 'desc' } });
     plu = (ultimo?.plu || 0) + 1;
  }

  if (id) {
    const datosActualizar = { nombre, precio, categoria };
    if (rutaImagen) datosActualizar.imagen = rutaImagen;

    await prisma.producto.update({
      where: { id: parseInt(id) },
      data: datosActualizar
    });
  } else {
    await prisma.producto.create({
      data: { 
        nombre, 
        precio, 
        categoria, 
        plu,
        imagen: rutaImagen,
        disponible: true,
        oferta: false
      }
    });
  }
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function eliminarProducto(id) {
  await prisma.producto.update({
    where: { id },
    data: { disponible: false }
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

// ==========================================
// 4. GESTIÓN DE PERSONAL (RRHH)
// ==========================================

export async function obtenerEmpleados() {
  return await prisma.empleado.findMany({ orderBy: { nombre: 'asc' } });
}

export async function guardarEmpleado(formData) {
  const nombre = formData.get('nombre').toUpperCase();
  const cargo = formData.get('cargo');
  const sueldoBase = parseInt(formData.get('sueldoBase'));
  const tipoContrato = formData.get('tipoContrato');

  await prisma.empleado.create({
    data: { nombre, cargo, sueldoBase, tipoContrato }
  });
  revalidatePath('/admin');
}

export async function eliminarEmpleado(id) {
  await prisma.empleado.delete({ where: { id } });
  revalidatePath('/admin');
}

// ==========================================
// 5. ZONA DE RED (PESAS DIGI - FTP)
// ==========================================

export async function obtenerBalanzas() {
  return await prisma.balanza.findMany();
}

export async function guardarBalanza(formData) {
  const nombre = formData.get('nombre');
  const ip = formData.get('ip');
  await prisma.balanza.create({ data: { nombre, ip } });
  revalidatePath('/admin');
}

// 🔥 AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA 🔥
export async function eliminarBalanza(id) {
  await prisma.balanza.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function sincronizarTodasLasPesas() {
  const balanzas = await prisma.balanza.findMany();
  const productos = await prisma.producto.findMany({ where: { disponible: true } });
  
  if (balanzas.length === 0) {
    return [{ nombre: 'Sistema', status: '⚠️ No hay balanzas configuradas.' }];
  }

  // Generar CSV Único
  const csvContent = productos.map(p => 
    `${p.plu},${p.precio},${p.nombre.replace(/,/g, '')}`
  ).join('\r\n');

  // Guardar archivo temporalmente
  const tempPath = join(process.cwd(), 'public', 'import_digi.csv');
  await writeFile(tempPath, csvContent);

  const resultados = [];

  // Enviar a todas las pesas
  await Promise.all(balanzas.map(async (b) => {
    const client = new ftp.Client();
    client.ftp.timeout = 5000;
    try {
      console.log(`📡 Conectando a ${b.ip}...`);
      try {
          await client.access({ host: b.ip, user: "admin", password: "", secure: false });
      } catch {
          await client.access({ host: b.ip, secure: false });
      }
      await client.uploadFrom(tempPath, "PLU.CSV");
      resultados.push({ nombre: b.nombre, status: '✅ OK' });
    } catch (err) {
      console.error(`Error en pesa ${b.nombre}:`, err);
      resultados.push({ nombre: b.nombre, status: '❌ Error Conexión' });
    } finally {
      client.close();
    }
  }));

  return resultados;
}