import { PrismaClient } from "@prisma/client";
// import Significado from "../models/Significado";
import Example from "../models/Examples";

const prisma = new PrismaClient();

export default {
    pendingWords: {
        create: async (parent, { input }, { user }) => {
            try {
                if (!user) return null;

                let {
                    texto,
                    fonetica,
                    traduccion,
                    idcontexto,
                    categoria_id,
                    idtipo,
                    base_id,

                    ejemplo_esp,
                    ejemplo_zap,
                } = input;

                texto = texto.toLowerCase();
                ejemplo_esp = ejemplo_esp.toLowerCase();
                ejemplo_zap = ejemplo_zap.toLowerCase();
                traduccion = traduccion.toLowerCase();
                fonetica = fonetica.toUpperCase();

                // Crear la palabra pendiente
                let nueva_palabra_pendiente = await prisma.palabras_pendientes.create(
                    {
                        data: {
                            texto,
                            fonetica,
                            traducciones: {
                                create: {
                                    traduccion,
                                },
                            },
                            tipo: {
                                connect: {
                                    id: idtipo,
                                },
                            },
                            categoria: {
                                connect: {
                                    id: categoria_id,
                                },
                            },
                            usuario: {
                                connect: {
                                    id: user.id,
                                },
                            },
                            base: {
                                connect: {
                                    id: base_id,
                                },
                            },
                        },
                    }
                );

                // Crear un nuevo contexto para la palabra
                await prisma.palabra_contexto.create({
                    data: {
                        contexto: {
                            connect: { id: idcontexto },
                        },
                        palabra_pendientes: {
                            connect: {
                                id: nueva_palabra_pendiente.id,
                            },
                        },
                    },
                });

                // Buscar la base de la palabra
                // let base = await prisma.bases.findOne({
                //     where: {
                //         id: base_id,
                //     },
                // });

                // Subir el significado a mongodb si no existe
                // let el_significado_existe = await Significado.findOne({
                //     $where: {
                //         palabra: base.base_esp,
                //     },
                // });

                // if (!el_significado_existe) {
                //     let nuevo_significado = new Significado({
                //         palabra: base.base_esp,
                //         significado: significado,
                //     });

                //     await nuevo_significado.save();
                // }

                // Subir los ejemplos a mongodb
                let nuevo_ejemplo = new Example({
                    palabra: texto,
                    ejemplo_esp,
                    ejemplo_zap,
                });

                await nuevo_ejemplo.save();

                return nueva_palabra_pendiente;
            } catch (err) {
                throw new Error(err);
            }
        },
        read: async (parent, args, context) => {
            try {
                let pendingWordsResponse = await prisma.palabras_pendientes.findMany(
                    {
                        include: {
                            traducciones: {
                                select: {
                                    traduccion: true,
                                },
                            },
                            contextos: {
                                select: {
                                    contexto: true,
                                },
                            },
                        },
                        orderBy: {
                            texto: "asc",
                        },
                    }
                );

                pendingWordsResponse = pendingWordsResponse.map(
                    (pendingWord) => {
                        if (pendingWord.traducciones.length > 0) {
                            let traducciones = pendingWord.traducciones.map(
                                ({ traduccion }) => traduccion
                            );

                            pendingWord = { ...pendingWord, traducciones };
                        }
                        if (pendingWord.contextos.length > 0) {
                            let contextos = pendingWord.contextos.map(
                                ({ contexto }) => contexto
                            );

                            pendingWord = { ...pendingWord, contextos };
                        }
                        return pendingWord;
                    }
                );

                return pendingWordsResponse;
            } catch (err) {
                throw new Error(err);
            }
        },
        check: async (parent, { id_usuario, id_palabra_p }, { user }) => {
            try {
                const hay_palabra = await prisma.palabras_pendientes.findOne({
                    where: {
                        id: id_palabra_p,
                    },
                });

                if (hay_palabra) {
                    const palabra_aprobada = await prisma.palabras_aprobadas.create(
                        {
                            data: {
                                texto: hay_palabra.texto,
                                fonetica: hay_palabra.fonetica,
                                tipo: {
                                    connect: {
                                        id: hay_palabra.idtipo,
                                    },
                                },
                                usuario: {
                                    connect: {
                                        id: id_usuario,
                                    },
                                },
                            },
                        }
                    );

                    let traducciones = await prisma.traducciones.findMany({
                        where: {
                            palabra_pid: hay_palabra.id,
                        },
                        select: {
                            id: true,
                        },
                    });

                    let contextos = await prisma.palabra_contexto.findMany({
                        where: {
                            id_posible_palabra: hay_palabra.id,
                        },
                        select: {
                            id: true,
                        },
                    });

                    traducciones = traducciones.map(({ id }) => id);
                    contextos = contextos.map(({ id }) => id);

                    for (const id_traduccion of traducciones) {
                        await prisma.palabras_aprobadas.update({
                            where: {
                                id: palabra_aprobada.id,
                            },
                            data: {
                                traducciones: {
                                    connect: {
                                        id: id_traduccion,
                                    },
                                },
                            },
                        });
                    }

                    for (const id_contexto of contextos) {
                        await prisma.palabra_contexto.update({
                            where: {
                                id: id_contexto,
                            },
                            data: {
                                palabra: {
                                    connect: {
                                        id: palabra_aprobada.id,
                                    },
                                },
                            },
                        });
                    }

                    await prisma.usuarios.update({
                        where: {
                            id: id_usuario,
                        },
                        data: {
                            puntos: {
                                increment: 1,
                            },
                        },
                    });

                    await prisma.palabras_pendientes.delete({
                        where: {
                            id: hay_palabra.id,
                        },
                    });

                    return { status: true };
                }

                return null;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
