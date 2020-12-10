import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
    pendingWords: {
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

                            return { ...pendingWord, traducciones };
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
