import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
    pendingWords: {
        read: async (parent, args, context) => {
            try {
                const pendingWordsResponse = await prisma.palabras_pendientes.findMany();
                return pendingWordsResponse;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
