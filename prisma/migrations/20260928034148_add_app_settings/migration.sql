-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "pinHash" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
