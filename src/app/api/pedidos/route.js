import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const nuevo = await prisma.pedido.create({
      data: {
        nombreCliente: data.nombre,
        detalle: JSON.stringify(data.carrito),
        total: data.total,
      },
    });
    return NextResponse.json(nuevo);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function GET() {
  const pedidos = await prisma.pedido.findMany({ orderBy: { fecha: 'desc' } });
  return NextResponse.json(pedidos);
}