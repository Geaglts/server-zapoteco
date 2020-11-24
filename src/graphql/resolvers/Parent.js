import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default {
    User: {
        async roles({ id }, args, context) {
            try {
                const allRoles = await prisma.usuarios.findUnique({
                    where: {
                        id,
                    },
                    select: {
                        roles: {
                            select: {
                                rol: {
                                    select: {
                                        desc: true,
                                        id: true,
                                        rol: true,
                                    },
                                },
                            },
                        },
                    },
                });

                let roles = allRoles.roles.map(({ rol }) => rol);

                return roles;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
