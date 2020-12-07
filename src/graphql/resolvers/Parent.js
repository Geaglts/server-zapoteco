import { PrismaClient } from "@prisma/client";
import Examples from "../../models/Examples";
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
    Words: {
        async examples(parent, args, context) {
            try {
                const ejemplosDeMongo = await Examples.find({
                    texto: parent.texto,
                });
                return ejemplosDeMongo;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
