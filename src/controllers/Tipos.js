import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default {
    async create(parent, { tipo }, context) {
        try {
            // Nuevo tipo
            const nuevoTipo = await prisma.tipos.create({
                data: { tipo },
            });

            console.log(nuevoTipo);

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
            const actualizacion = await prisma.tipos.update({
                where: { id },
                data: { tipo },
            });

            console.log(actualizacion);

            return { status: true, msg: "Actualizado correctamente" };
        } catch (err) {
            throw new Error(err);
        }
    },
};
