-- CreateEnum
CREATE TYPE "GovernancePhase" AS ENUM ('SPONSOR_MANAGED', 'TRANSITION', 'MEMBER_GOVERNED');
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'LAPSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Cooperative" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "networkName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "networkFeeCents" INTEGER NOT NULL,
    "serviceTier" TEXT NOT NULL,
    "acceptingMembers" BOOLEAN NOT NULL DEFAULT false,
    "governancePhase" "GovernancePhase" NOT NULL DEFAULT 'SPONSOR_MANAGED',
    "sponsorName" TEXT NOT NULL DEFAULT 'SUMOFIBER',
    "sponsorTermStart" TIMESTAMP(3),
    "sponsorTermEnd" TIMESTAMP(3),
    "networkBuiltAt" TIMESTAMP(3),
    "handedOverAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceAddress" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "paidThrough" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostBasis" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "fixedOverheadMonthlyCents" INTEGER NOT NULL,
    "variableCostPerMemberCents" INTEGER NOT NULL,
    "reserveTargetMonths" INTEGER NOT NULL DEFAULT 6,
    "reserveRecoveryMonths" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CostBasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuarterlyPrice" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "paidMembersAtCalc" INTEGER NOT NULL,
    "networkFeeCents" INTEGER NOT NULL,
    "overheadShareCents" INTEGER NOT NULL,
    "variableCostCents" INTEGER NOT NULL,
    "reserveContributionCents" INTEGER NOT NULL,
    "totalMonthlyCents" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuarterlyPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReserveSnapshot" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    CONSTRAINT "ReserveSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BallotOption" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "BallotOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "castAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_slug_key" ON "Cooperative"("slug");
CREATE UNIQUE INDEX "Member_stripeCustomerId_key" ON "Member"("stripeCustomerId");
CREATE UNIQUE INDEX "Member_stripeSubscriptionId_key" ON "Member"("stripeSubscriptionId");
CREATE UNIQUE INDEX "Member_cooperativeId_email_key" ON "Member"("cooperativeId", "email");
CREATE INDEX "Member_cooperativeId_status_idx" ON "Member"("cooperativeId", "status");
CREATE UNIQUE INDEX "CostBasis_cooperativeId_quarter_key" ON "CostBasis"("cooperativeId", "quarter");
CREATE UNIQUE INDEX "QuarterlyPrice_cooperativeId_quarter_key" ON "QuarterlyPrice"("cooperativeId", "quarter");
CREATE INDEX "ReserveSnapshot_cooperativeId_asOf_idx" ON "ReserveSnapshot"("cooperativeId", "asOf");
CREATE UNIQUE INDEX "Vote_ballotId_memberId_key" ON "Vote"("ballotId", "memberId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CostBasis" ADD CONSTRAINT "CostBasis_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuarterlyPrice" ADD CONSTRAINT "QuarterlyPrice_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReserveSnapshot" ADD CONSTRAINT "ReserveSnapshot_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BallotOption" ADD CONSTRAINT "BallotOption_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "BallotOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
