-- CreateTable
CREATE TABLE "addresses" (
    "id" VARCHAR(50) NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "postal_code" INTEGER NOT NULL,
    "contact_id" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
