import { PrismaClient } from "@prisma/client";
import { printSchema } from "graphql";
const prisma = new PrismaClient();

export default {
    async create(parent, { categoria }, context) {
        try {
            //Ver si la categoria existe
            const categoriaExiste = await prisma.categorias.findFirst({
                where: {
                    categoria: categoria.toLowerCase(),
                },
            });

            if (categoriaExiste)
                return { status: true, msg: "La categoria ya existe" };

            // Nuevo tipo
            await prisma.categorias.create({
                data: {
                    categoria: categoria.toLowerCase(),
                },
            });

            return { status: true, msg: "Creado correctamente" };
        } catch (err) {
            throw new Error(err);
        }
    },
    async read(parent, args, context) {
        try {
            // Todos los tipos
            const categorias = await prisma.categorias.findMany();
            return categorias;
        } catch (err) {
            throw new Error(err);
        }
    },
    async update(parent, { id, categoria }, context) {
        try {
            // Actualizar un tipo
            await prisma.categorias.update({
                where: {
                    id,
                },
                data: {
                    categoria: categoria.toLowerCase(),
                },
            });

            return { status: true, msg: "Actualizado correctamente" };
        } catch (err) {
            throw new Error(err);
        }
    },
};
