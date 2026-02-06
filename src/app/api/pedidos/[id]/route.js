import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function PATCH(request, context) {
  const { id } = await context.params;
  const { estado } = await request.json();
  const actualizado = await prisma.pedido.update({
    where: { id: parseInt(id) },
    data: { estado: estado },
  });
  return NextResponse.json(actualizado);
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  await prisma.pedido.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ message: "Borrado" });
}