import { PrismaClient } from "@prisma/client";
import Examples from "../../models/Examples";
import Significados from "../../models/Significado";
const prisma = new PrismaClient();

export default {
    User: {
        async roles({ id }, args, context) {
            try {
                const allRoles = await prisma.usuarios.findOne({
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

                let roles = allRoles.roles.map(({ rol: { rol } }) => rol);

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
                    significado: significadoDePalabra?.significado,
                };
            } catch (err) {
                throw new Error(err);
            }
        },
        async tipo(parent, args, context) {
            try {
                let id = parent.idtipo;
                const tipo = await prisma.tipos.findOne({
                    where: {
                        id,
                    },
                });
                return tipo.tipo;
            } catch (err) {
                throw new Error(err);
            }
        },
        async categoria(parent, args, context) {
            try {
                if (!parent.categoria_id) {
                    return null;
                }

                let categoria = await prisma.categorias.findFirst({
                    where: {
                        id: parent.categoria_id,
                    },
                    select: {
                        categoria: true,
                    },
                });

                return categoria.categoria;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
