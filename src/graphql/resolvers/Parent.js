import { PrismaClient } from "@prisma/client";
import Examples from "../../models/Examples";
import Significados from "../../models/Significado";
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
        async more(parent, args, context) {
            try {
                const ejemplosDePalabra = await Examples.find({
                    palabra: parent.texto,
                });
                const significadoDePalabra = await Significados.findOne(
                    {
                        palabra: parent.texto,
                    },
                    {
                        significado: true,
                        _id: false,
                    }
                );
                return {
                    examples: ejemplosDePalabra,
                    significado: significadoDePalabra.significado,
                };
            } catch (err) {
                throw new Error(err);
            }
        },
        async tipo(parent, args, context) {
            try {
                switch (parent.tipo) {
                    case 0:
                        return "palabra";
                    case 1:
                        return "frase";
                    default:
                        return null;
                }
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
