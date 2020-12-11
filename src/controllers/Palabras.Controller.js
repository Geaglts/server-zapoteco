import { PrismaClient } from "@prisma/client";
// import Significado from "../models/Significado";
import Example from "../models/Examples";
import Base from "../models/Base";

const prisma = new PrismaClient();

export default {
    words: {
        assignBase: async (parent, args, context) => {
            try {
                const { base_id, word_id } = args;
                // Busca la base
                const base = await Base.findById(base_id);
                if (!base) return null;

                // Busca la palabra y actualiza
                const word_with_base = await prisma.palabras_aprobadas.update({
                    where: {
                        id: word_id,
                    },
                    data: {
                        base_id,
                    },
                });

                // Retorna la palabra
                return word_with_base;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
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

                // Busca si ya existe en la tabla de palabras principales
                const palabra_aprobada = await prisma.palabras_aprobadas.findOne(
                    {
                        where: {
                            texto,
                        },
                    }
                );

                if (palabra_aprobada) return null;

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
                            base_id,
                            ejemplo_esp,
                            ejemplo_zap,
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
                            id: "asc",
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
        udpate: async (parent, args, context) => {
            try {
            } catch (err) {
                throw new Error(err);
            }
        },
        delete: async (parent, { palabra_id }, { user }) => {
            try {
                if (!user) return null;
                let user_id = user.id;

                // Verifica si la palabra es de ese usuario
                let palabra_por_eliminar = await prisma.palabras_pendientes.findFirst(
                    {
                        where: {
                            AND: [
                                {
                                    usuario: {
                                        id: user_id,
                                    },
                                },
                                {
                                    id: palabra_id,
                                },
                            ],
                        },
                    }
                );

                if (palabra_por_eliminar?.id !== palabra_id) return null;

                // Eliminar los residuos de donde esta la palabra
                // Traducciones
                await prisma.traducciones.deleteMany({
                    where: {
                        palabra_pid: palabra_id,
                    },
                });
                // Palabras contextos
                await prisma.palabra_contexto.deleteMany({
                    where: {
                        id_posible_palabra: palabra_id,
                    },
                });

                await prisma.palabras_pendientes.delete({
                    where: {
                        id: palabra_id,
                    },
                });

                return true;
            } catch (err) {
                throw new Error(err);
            }
        },
        check: async (parent, { id_usuario, id_palabra_p }, { user }) => {
            try {
                if (!user) return null;

                const hay_palabra = await prisma.palabras_pendientes.findOne({
                    where: {
                        id: id_palabra_p,
                    },
                });

                if (hay_palabra) {
                    let palabra_aprobada_data = {
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
                    };

                    if (hay_palabra.categoria_id) {
                        palabra_aprobada_data = {
                            ...palabra_aprobada_data,
                            categoria: {
                                connect: {
                                    id: hay_palabra.categoria_id,
                                },
                            },
                        };
                    }

                    if (hay_palabra.base_id) {
                        palabra_aprobada_data = {
                            ...palabra_aprobada_data,
                            base_id: hay_palabra.base_id,
                        };
                    }

                    const palabra_aprobada = await prisma.palabras_aprobadas.create(
                        {
                            data: {
                                ...palabra_aprobada_data,
                                aprobada_por: {
                                    connect: {
                                        id: user.id,
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

                    // Subir los ejemplos a mongodb
                    let nuevo_ejemplo = new Example({
                        palabra: hay_palabra.texto,
                        ejemplo_esp: hay_palabra.ejemplo_esp,
                        ejemplo_zap: hay_palabra.ejemplo_zap,
                    });

                    await nuevo_ejemplo.save();

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
        assignBase: async (parent, args, context) => {
            try {
                const { base_id, pending_word_id } = args;
                // Busca la base
                const base = await Base.findById(base_id);
                if (!base) return null;

                // Busca la palabra y actualiza
                const word_with_base = await prisma.palabras_pendientes.update({
                    where: {
                        id: pending_word_id,
                    },
                    data: {
                        base_id,
                    },
                });

                // Retorna la palabra
                return word_with_base;
            } catch (err) {
                throw new Error(err);
            }
        },
        rejectWord: async (parent, { palabra_id, mensaje }, { user }) => {
            try {
                // Ver si el mensaje tiene mas de 2 caracteres
                if (mensaje.length < 3) return false;

                // Busca si hay un usuario
                if (!user) return false;

                // Obten el id del usuario
                const usuario_id = user.id;

                // Actualizar la palabra a rechazada
                await prisma.palabras_pendientes.update({
                    where: {
                        id: palabra_id,
                    },
                    data: {
                        rechazado: true,
                        usuario_que_rechazo: {
                            connect: {
                                id: usuario_id,
                            },
                        },
                        mensaje,
                    },
                });

                return true;
            } catch (err) {
                throw new Error(err);
            }
        },
        resendToRevision: async (parent, { palabra_id }, { user }) => {
            try {
                if (!user) return null;
                let user_id = user.id;

                // Verifica si la palabra es de ese usuario
                let palabra_por_eliminar = await prisma.palabras_pendientes.count(
                    {
                        where: {
                            AND: [
                                {
                                    usuario: {
                                        id: user_id,
                                    },
                                },
                                {
                                    id: palabra_id,
                                },
                            ],
                        },
                    }
                );

                if (palabra_por_eliminar === 0) return null;

                // Resetear los valores de mensaje, rechazado, rechazado_por
                await prisma.palabras_pendientes.update({
                    where: {
                        id: palabra_id,
                    },
                    data: {
                        rechazado: false,
                        mensaje: null,
                        usuario_que_rechazo: {
                            disconnect: true,
                        },
                    },
                });

                return true;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
