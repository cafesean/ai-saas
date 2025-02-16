-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "role_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_roles" (
    "level_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "level_roles_pkey" PRIMARY KEY ("level_id","role_id")
);

-- CreateTable
CREATE TABLE "ratecards" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "expire_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_rates" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "monthly_rate" DECIMAL(10,2) NOT NULL,
    "level_id" INTEGER NOT NULL,
    "ratecard_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "levels_uuid_key" ON "levels"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ratecards_uuid_key" ON "ratecards"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "level_rates_uuid_key" ON "level_rates"("uuid");

-- AddForeignKey
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_ratecard_id_fkey" FOREIGN KEY ("ratecard_id") REFERENCES "ratecards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
