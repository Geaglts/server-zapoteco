import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default {
    async create(parent, { tipo }, context) {
        try {
            // Nuevo tipo
            return { status: true, msg: "Creado correctamente" };
        } catch (err) {
            throw new Error(err);
        }
    },
    async read(parent, args, context) {
        try {
            // Todos los tipos
            const tipos = await prisma.tipos.findMany();
            return tipos;
        } catch (err) {
            throw new Error(err);
        }
    },
    async update(parent, { id, tipo }, context) {
        try {
            // Actualizar un tipo
            return { status: true, msg: "Actualizado correctamente" };
        } catch (err) {
            throw new Error(err);
        }
    },
};
