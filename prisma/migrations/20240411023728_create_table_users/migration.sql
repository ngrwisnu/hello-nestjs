-- CreateTable
CREATE TABLE "users" (
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "token" VARCHAR(50),

    CONSTRAINT "users_pkey" PRIMARY KEY ("username")
);
