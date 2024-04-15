-- CreateTable
CREATE TABLE "contacts" (
    "id" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50),
    "email" VARCHAR(50),
    "phone" VARCHAR(50),
    "user_id" TEXT,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("username") ON DELETE SET NULL ON UPDATE CASCADE;
