-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "oferta" BOOLEAN NOT NULL DEFAULT false,
    "stock" REAL NOT NULL DEFAULT 0
);
