-- CreateTable
CREATE TABLE "Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreCliente" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
