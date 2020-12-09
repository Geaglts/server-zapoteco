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
};
