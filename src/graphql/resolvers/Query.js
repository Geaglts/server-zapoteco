import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
    async getRols(parent, args, context) {
        try {
            const rols = await prisma.roles.findMany();

            return rols;
        } catch (err) {
            throw new Error(err);
        }
    },
};
