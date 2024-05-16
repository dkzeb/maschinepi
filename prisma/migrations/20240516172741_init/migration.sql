/*
  Warnings:

  - The primary key for the `Sample` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "data" BLOB NOT NULL
);
INSERT INTO "new_Sample" ("data", "id", "name") SELECT "data", "id", "name" FROM "Sample";
DROP TABLE "Sample";
ALTER TABLE "new_Sample" RENAME TO "Sample";
PRAGMA foreign_key_check("Sample");
PRAGMA foreign_keys=ON;
