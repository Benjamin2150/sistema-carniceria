const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productos = [
  // --- PARRILLA & ASADOS (Cortes Nobles) ---
  { nombre: 'LOMO VETADO', precio: 7480, categoria: 'Parrilla', plu: 28 },
  { nombre: 'LOMO LISO', precio: 8480, categoria: 'Parrilla', plu: 27 },
  { nombre: 'FILETE', precio: 10480, categoria: 'Parrilla', plu: 19 },
  { nombre: 'ENTRAÑA', precio: 7480, categoria: 'Parrilla', plu: 18 },
  { nombre: 'ASADO CARNICERO', precio: 5480, categoria: 'Parrilla', plu: 7 },
  { nombre: 'ABASTERO', precio: 5480, categoria: 'Parrilla', plu: 1 },
  { nombre: 'PUNTA DE GANSO', precio: 6480, categoria: 'Parrilla', plu: 46 },
  { nombre: 'PALANCA', precio: 7480, categoria: 'Parrilla', plu: 31 },
  { nombre: 'SOBRECOSTILLA', precio: 5480, categoria: 'Parrilla', plu: 51 },
  { nombre: 'PLATEADA', precio: 4980, categoria: 'Parrilla', plu: 39 },
  { nombre: 'COSTILLAR', precio: 2990, categoria: 'Parrilla', plu: 17 },

  // --- PARA LA OLLA (Cacerola y Guisos) ---
  { nombre: 'POSTA NEGRA', precio: 6880, categoria: 'Olla', plu: 42 },
  { nombre: 'POSTA ROSADA', precio: 6880, categoria: 'Olla', plu: 44 },
  { nombre: 'POSTA PALETA', precio: 6480, categoria: 'Olla', plu: 43 },
  { nombre: 'CHOCLILLO', precio: 6480, categoria: 'Olla', plu: 12 },
  { nombre: 'POLLO GANSO', precio: 6480, categoria: 'Olla', plu: 40 },
  { nombre: 'TAPABARRIGA', precio: 7480, categoria: 'Olla', plu: 52 },
  { nombre: 'TAPAPECHO', precio: 4980, categoria: 'Olla', plu: 53 },
  { nombre: 'OSSOBUCO (TURÍN)', precio: 5120, categoria: 'Olla', plu: 54 },
  { nombre: 'CAZUELA (LISA)', precio: 5120, categoria: 'Olla', plu: 26 },

  // --- COCINA DIARIA (Rápido y Económico) ---
  { nombre: 'MOLIDA', precio: 1980, categoria: 'Diario', plu: 30 },
  { nombre: 'ASADO MOLIDO', precio: 3980, categoria: 'Diario', plu: 8 },
  { nombre: 'CHURRASCOS', precio: 5980, categoria: 'Diario', plu: 14 },
  { nombre: 'MILANESA', precio: 7520, categoria: 'Diario', plu: 29 },
  { nombre: 'COLUDA', precio: 1980, categoria: 'Diario', plu: 15 },
  { nombre: 'HÍGADO', precio: 1980, categoria: 'Diario', plu: 21 },
  { nombre: 'GUATAS', precio: 1980, categoria: 'Diario', plu: 20 },
  
  // --- EMBUTIDOS & FIAMBRES ---
  { nombre: 'ARROLLADO HUASO', precio: 8400, categoria: 'Fiambrería', plu: 4 },
  { nombre: 'ARROLLADO LOMO', precio: 6320, categoria: 'Fiambrería', plu: 5 },
  { nombre: 'QUESO CABEZA', precio: 4980, categoria: 'Fiambrería', plu: 47 },
  { nombre: 'JAMÓN PIERNA', precio: 9920, categoria: 'Fiambrería', plu: 23 },
  { nombre: 'QUESO LAMINADO', precio: 9920, categoria: 'Fiambrería', plu: 49 },
  { nombre: 'LONGANIZA', precio: 5000, categoria: 'Fiambrería', plu: 55 },

  // --- POLLO ---
  { nombre: 'PECHUGA POLLO', precio: 4280, categoria: 'Aves', plu: 36 },

  // --- DESPENSA & CONGELADOS ---
  { nombre: 'PAPAS PREFRITAS', precio: 2980, categoria: 'Despensa', plu: 33 },
  { nombre: 'CHOCLO GRANO', precio: 3380, categoria: 'Despensa', plu: 13 },
  { nombre: 'ARVEJAS', precio: 3480, categoria: 'Despensa', plu: 6 },
  { nombre: 'ACEITUNAS', precio: 7920, categoria: 'Despensa', plu: 2 },
  { nombre: 'CARBON 2.5KG', precio: 2500, categoria: 'Despensa', plu: 99 },
];

async function main() {
  console.log('🔥 Recategorizando productos para mejor venta...');
  
  // Usuario Admin
  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: '123' },
  });

  for (const p of productos) {
    await prisma.producto.upsert({
      where: { plu: p.plu },
      update: { precio: p.precio, categoria: p.categoria, nombre: p.nombre },
      create: {
        nombre: p.nombre,
        precio: p.precio,
        categoria: p.categoria,
        plu: p.plu,
        disponible: true,
        oferta: false,
      },
    });
  }
  console.log('✅ ¡Inventario listo para vender!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());