import { PrismaClient } from "@prisma/client";
import Examples from "../../models/Examples";
import Significados from "../../models/Significado";
import Base from "../../models/Base";
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
        async palabrasAgregadas(parent, args, context) {
            try {
                return prisma.palabras_aprobadas.count({
                    where: {
                        usuarioid: parent.id,
                    },
                });
            } catch (err) {
                throw new Error(err);
            }
        },
        async palabrasRechazadas(parent, args, context) {
            try {
                return prisma.palabras_pendientes.count({
                    where: {
                        AND: [
                            {
                                usuarioid: parent.id,
                            },
                            {
                                rechazado: true,
                            },
                        ],
                    },
                });
            } catch (err) {
                throw new Error(err);
            }
        },
        async palabrasPendientes(parent, args, context) {
            try {
                return prisma.palabras_pendientes.count({
                    where: {
                        AND: [
                            {
                                usuarioid: parent.id,
                            },
                            {
                                rechazado: false,
                            },
                        ],
                    },
                });
            } catch (err) {
                throw new Error(err);
            }
        },
        async palabrasVerificadas(parent, args, context) {
            try {
                return prisma.palabras_aprobadas.count({
                    where: {
                        id_aprobado_por: parent.id,
                    },
                });
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
        async base(parent, args, context) {
            try {
                if (!parent.base_id) return null;
                return await Base.findById(parent.base_id);
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    PendingWord: {
        async example(parent, args, context) {
            try {
                return {
                    ejemplo_esp: parent.ejemplo_esp,
                    ejemplo_zap: parent.ejemplo_zap,
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
        async base(parent, args, context) {
            try {
                if (!parent.base_id) return null;
                return await Base.findById(parent.base_id);
            } catch (err) {
                throw new Error(err);
            }
        },
        async traducciones(parent, args, context) {
            try {
                let traducciones = await prisma.palabras_pendientes.findOne({
                    where: {
                        id: parent.id,
                    },
                    select: {
                        traducciones: {
                            select: {
                                traduccion: true,
                            },
                        },
                    },
                });

                traducciones = traducciones.traducciones.map(
                    ({ traduccion }) => traduccion
                );

                return traducciones;
            } catch (err) {
                throw new Error(err);
            }
        },
        async contextos(parent, args, context) {
            try {
                let contextos = await prisma.palabras_pendientes.findOne({
                    where: {
                        id: parent.id,
                    },
                    select: {
                        contextos: {
                            select: {
                                contexto: true,
                            },
                        },
                    },
                });

                contextos = contextos.contextos.map(({ contexto }) => contexto);

                return contextos;
            } catch (err) {
                throw new Error(err);
            }
        },
        async rechazado_por(parent, args, context) {
            try {
                if (!parent.rechazado_por) return null;
                return await prisma.usuarios.findOne({
                    where: {
                        id: parent.rechazado_por,
                    },
                });
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
