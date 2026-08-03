-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "style" TEXT NOT NULL DEFAULT 'modern',
    "sections" TEXT NOT NULL DEFAULT 'hero,features,cta',
    "prompt" TEXT NOT NULL DEFAULT '',
    "html" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Site_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("createdAt", "description", "html", "id", "name", "prompt", "published", "sections", "slug", "style", "updatedAt", "userId") SELECT "createdAt", "description", "html", "id", "name", "prompt", "published", "sections", "slug", "style", "updatedAt", "userId" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
