import { PrismaClient } from "@/app/generated/prisma";
import { env } from "@/constants";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as {
	prisma: PrismaClient;
};

const prisma =
	globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

if (env !== "production") globalForPrisma.prisma = prisma;

export default prisma;
