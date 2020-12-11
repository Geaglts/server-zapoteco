import { PrismaClient } from "@prisma/client";
import validator from "validator";

const prisma = new PrismaClient();

const validLength = (field) => {
    if (field.length > 0) {
        return true;
    }
    return false;
};

export default {
    readOne: async (parent, { correo }, context) => {
        try {
            if (validator.isEmail(correo)) {
                const siHayUsuario = await prisma.usuarios.findOne({
                    where: {
                        correo,
                    },
                });

                if (siHayUsuario) {
                    return siHayUsuario;
                }

                return null;
            }
            return null;
        } catch (err) {
            throw new Error(err);
        }
    },
    rols: {
        async set(parent, { rolids, usuarioid }, context) {
            try {
                //Valida los datos de entrada
                const validInputs = validLength(rolids);

                if (!validInputs) {
                    return { status: false };
                }

                //Elimina todos los roles del usuario
                await prisma.usuario_rol.deleteMany({
                    //where id_usuario = usuarioid
                    where: {
                        usuarioid,
                    },
                });

                for (const rolid of rolids) {
                    //Asigna el rol
                    await prisma.usuario_rol.create({
                        //connect where id usuario = usuarioid
                        //connect where id rol = rolid
                        data: {
                            rol: {
                                connect: {
                                    id: rolid,
                                },
                            },
                            usuario: {
                                connect: {
                                    id: usuarioid,
                                },
                            },
                        },
                    });
                }
                return { status: true };
            } catch (e) {
                throw new Error(e);
            }
        },
    },
    teacher: {
        verifiers: async (parent, args, { user }) => {
            try {
                if (!user) return null;

                return await prisma.usuarios.findMany({
                    where: {
                        roles: {
                            some: {
                                rol: {
                                    rol: {
                                        equals: "verificador",
                                    },
                                },
                            },
                        },
                    },
                });
            } catch (err) {
                throw new Error(err);
            }
        },
        capturers: async (parent, args, { user }) => {
            try {
                if (!user) return null;

                return await prisma.usuarios.findMany({
                    where: {
                        roles: {
                            some: {
                                rol: {
                                    rol: {
                                        equals: "capturador",
                                    },
                                },
                            },
                        },
                    },
                });
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    verifier: {
        approved: async (parent, args, { user }) => {
            try {
                if (!user) return null;

                const approvedWords = await prisma.palabras_aprobadas.findMany({
                    where: {
                        id_aprobado_por: user.id,
                    },
                });

                return approvedWords;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    words: {
        approved: async (parent, args, { user }) => {
            try {
                if (!user) return null;

                const approvedWords = await prisma.palabras_aprobadas.findMany({
                    where: {
                        usuarioid: user.id,
                    },
                });

                return approvedWords;
            } catch (err) {
                throw new Error(err);
            }
        },
        pendign: async (parent, args, { user }) => {
            try {
                if (!user) return null;

                const approvedWords = await prisma.palabras_pendientes.findMany(
                    {
                        where: {
                            AND: [
                                {
                                    usuarioid: user.id,
                                },
                                {
                                    rechazado: false,
                                },
                            ],
                        },
                    }
                );

                return approvedWords;
            } catch (err) {
                throw new Error(err);
            }
        },
        rejected: async (parent, args, { user }) => {
            try {
                if (!user) return null;

                const approvedWords = await prisma.palabras_pendientes.findMany(
                    {
                        where: {
                            AND: [
                                {
                                    usuarioid: user.id,
                                },
                                {
                                    rechazado: true,
                                },
                            ],
                        },
                    }
                );

                return approvedWords;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
