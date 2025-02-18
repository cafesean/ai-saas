-- AlterTable
ALTER TABLE "level_rates" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "levels" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "ratecards" RENAME CONSTRAINT "ratecards_pkey" TO "rate_cards_pkey",
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "org" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "country_id" INTEGER,
    "type" SMALLINT,
    "logo_url" TEXT,
    "slug" TEXT,
    "uuid" UUID DEFAULT uuid_generate_v4(),
    "updated_at" TIMESTAMPTZ(6),
    "status" SMALLINT,
    "tier_id" INTEGER NOT NULL DEFAULT 1,
    "category_id" INTEGER,
    "plan_id" INTEGER,
    "verified_at" TIMESTAMP(3),
    "business_address" TEXT,
    "business_licenses" TEXT[],
    "linkedin_url" TEXT,
    "website" TEXT,

    CONSTRAINT "org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_user" (
    "org_id" INTEGER NOT NULL,
    "user_uuid" UUID,
    "role" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "org_user_pkey" PRIMARY KEY ("org_id","user_id")
);

-- CreateTable
CREATE TABLE "role_policy" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "can_create" BOOLEAN NOT NULL DEFAULT false,
    "can_read" BOOLEAN NOT NULL DEFAULT false,
    "can_update" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "role_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" SMALLINT,
    "wallets" TEXT[],
    "wallet_type" INTEGER,
    "attributes" JSONB,
    "tokens" JSONB,
    "xp" JSONB,
    "profile" JSONB,
    "role_id" INTEGER[],
    "org_id" INTEGER[],
    "updated_at" TIMESTAMPTZ(6),
    "referred_by" TEXT,
    "is_registered" BOOLEAN,
    "name" TEXT,
    "email" JSON,
    "password" TEXT,
    "phone" JSON,
    "avatar" TEXT,
    "username" TEXT,
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "policy_ops" JSON,
    "policy_org" JSON,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_policy" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "can_create" BOOLEAN NOT NULL DEFAULT false,
    "can_read" BOOLEAN NOT NULL DEFAULT false,
    "can_update" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "group_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricings" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "ratecard_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "resource_count" INTEGER NOT NULL,
    "overall_discounts" JSON,

    CONSTRAINT "pricings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_roles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "pricing_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "override_price" DECIMAL(10,2),
    "discount_rate" DECIMAL(5,2),
    "multiplier" DECIMAL(5,2) NOT NULL,
    "final_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pricing_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pricings_uuid_key" ON "pricings"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pricings_code_key" ON "pricings"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_roles_uuid_key" ON "pricing_roles"("uuid");

-- AddForeignKey
ALTER TABLE "org_user" ADD CONSTRAINT "org_user_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_user" ADD CONSTRAINT "org_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_policy" ADD CONSTRAINT "role_policy_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_policy" ADD CONSTRAINT "group_policy_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_ratecard_id_fkey" FOREIGN KEY ("ratecard_id") REFERENCES "ratecards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_pricing_id_fkey" FOREIGN KEY ("pricing_id") REFERENCES "pricings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
