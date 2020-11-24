import { PrismaClient } from "@prisma/client";

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
};
