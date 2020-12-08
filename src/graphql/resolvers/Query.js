import { PrismaClient } from "@prisma/client";
import { Categorias, Tipos } from "../../controllers";

const prisma = new PrismaClient();

export default {
    async getRols(parent, args, { user }) {
        try {
            if (!user) throw new Error("Not Authorized");

            const rols = await prisma.roles.findMany();

            return rols;
        } catch (err) {
            throw new Error(err);
        }
    },
    getTypes: Tipos.read,
    async aboutMe(parent, args, { user }) {
        try {
            if (!user) throw new Error("Not Authorized");

            let userExists = await prisma.usuarios.findUnique({
                where: {
                    id: user.id,
                },
            });

            delete userExists.contrasena;

            return userExists;
        } catch (err) {
            throw new Error(err);
        }
    },
    async myRoles(parent, args, { user }) {
        try {
            if (!user) throw new Error("Not Authorized");

            let usuario = await prisma.usuarios.findUnique({
                where: { id: user.id },
                select: {
                    admin: true,
                    roles: {
                        select: {
                            rol: {
                                select: {
                                    rol: true,
                                },
                            },
                        },
                    },
                },
            });

            return usuario.roles.map(({ rol }) => rol.rol);
        } catch (err) {
            throw new Error(err);
        }
    },
    async getWords(parent, args, context) {
        try {
            let palabras = await prisma.palabras_aprobadas.findMany({
                include: {
                    traducciones: {
                        select: {
                            traduccion: true,
                        },
                    },
                },
            });

            palabras = palabras.map((palabra) => {
                if (palabra.traducciones.length > 0) {
                    let traducciones = palabra.traducciones.map(
                        ({ traduccion }) => traduccion
                    );

                    return { ...palabra, traducciones };
                }
                return palabra;
            });

            return palabras;
        } catch (err) {
            throw new Error(err);
        }
    },
    // Categorias
    getCategories: Categorias.read,
};
