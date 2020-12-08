import { PrismaClient } from "@prisma/client";
import {
    TiposController,
    CategoriasController,
    ContextoController,
    UsuarioController,
} from "../../controllers";
import * as Utils from "../../utils";

const prisma = new PrismaClient();

export default {
    async newUser(parent, { input }, context) {
        try {
            /**
             * Autorizacion y Autenticacion
             * await Utils.verifyRoles(validRoles, user.id, prisma);
             */

            /**
             * Implementacion de la Funcionalidad
             */
            let excludes = ["ncontrol"];
            let inputs = Utils.validateString(input, excludes);
            if (!inputs) return { status: "check your entries" };

            let userExists = await prisma.usuarios.findUnique({
                where: {
                    correo: inputs.correo,
                },
            });

            if (userExists) return { status: "user exists" };

            /**
             * Genera nueva contrasena
             */
            const { encryptPassword } = Utils.auth;
            let newContrasena = await encryptPassword(inputs.contrasena);

            let numberOfUsers = await prisma.usuarios.count();
            let admin = numberOfUsers === 0;

            let usuario = await prisma.usuarios.create({
                data: {
                    ...{ ...inputs, contrasena: newContrasena },
                    admin,
                },
            });

            // Le asigna el rol de visitante
            await prisma.usuario_rol.create({
                data: {
                    rol: {
                        connect: {
                            id: 2,
                        },
                    },
                    usuario: {
                        connect: {
                            id: usuario.id,
                        },
                    },
                },
            });

            return { correo: inputs.correo, status: true };
        } catch (err) {
            throw new Error(err);
        }
    },
    async assignRoles(parent, { rolIds: roles, userId }, { user }) {
        try {
            let rolIds = roles;
            /**
             * Restricciones:
             * 1.- Solo el admin puede crear coordinadores
             */
            // 1
            if (rolIds.includes(5) && !user?.admin) {
                rolIds = rolIds.filter((i) => i !== 5);
            }
            /**
             * Autorizacion y Autenticacion
             */
            let validRoles = ["coordinador"];
            await Utils.verifyRoles(validRoles, user?.id, prisma);
            /**
             * Implementacion de la Funcionalidad
             */
            let invalidInput = (userId.length === 0) | (rolIds.length === 0);
            if (invalidInput) return { status: "there is an empty input" };

            await prisma.usuario_rol.deleteMany({
                where: {
                    usuarioid: userId,
                },
            });

            for (let rolid of rolIds) {
                await prisma.usuario_rol.create({
                    data: {
                        rol: {
                            connect: {
                                id: rolid,
                            },
                        },
                        usuario: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                });
            }

            return { status: "roles added correctly" };
        } catch (err) {
            throw new Error(err);
        }
    },
    async login(parent, inputs, context) {
        try {
            let verifiedInputs = Utils.validateString(inputs);
            if (!verifiedInputs) return { status: "check your entries" };

            let user = await prisma.usuarios.findMany({
                where: {
                    OR: [
                        {
                            usuario: inputs.user,
                        },
                        {
                            correo: inputs.user,
                        },
                    ],
                },
                select: {
                    id: true,
                    contrasena: true,
                    admin: true,
                },
            });

            if (user.length === 0)
                return { status: "incorrect user and/or password" };

            const password = verifiedInputs.contrasena;
            const hashPassword = user[0].contrasena;

            let { comparePassword } = Utils.auth;
            const passwordMatch = await comparePassword(password, hashPassword);

            if (!passwordMatch)
                return { status: "incorrect user and/or password" };

            delete user[0].contrasena;

            const { generateToken } = Utils.token;
            const token = generateToken({ ...user[0] });

            return { admin: user[0].admin, token };
        } catch (err) {
            throw new Error(err);
        }
    },
    async newWord(parent, { input }, { user }) {
        try {
            let userWordExists = await prisma.palabras_pendientes.findFirst({
                where: {
                    usuario: {
                        id: user.id,
                    },
                    texto: input.zap.toLowerCase(),
                },
            });

            if (userWordExists) {
                return { message: "Ya registraste esta palabra" };
            }

            let wordExists = await prisma.palabras_aprobadas.findUnique({
                where: {
                    texto: input.zap.toLowerCase(),
                },
            });

            if (wordExists) {
                return { message: "Esta palabra ya se encuentra registrada" };
            }

            let pendiente = await prisma.palabras_pendientes.create({
                data: {
                    texto: input.zap.toLowerCase(),
                    tipo: input.tipo,
                    usuario: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            });

            for (const esp of input.esp) {
                await prisma.traducciones.create({
                    data: {
                        traduccion: esp.toLowerCase(),
                        pendiente: {
                            connect: {
                                id: pendiente.id,
                            },
                        },
                    },
                });
            }

            return { message: "La palabra ha sido agregada" };
        } catch (err) {
            throw new Error(err);
        }
    },
    //Tipos
    newType: TiposController.create,
    updateType: TiposController.update,
    //Categorias
    newCategory: CategoriasController.create,
    updateCategory: CategoriasController.update,
    //Contextos
    newContexto: ContextoController.create,
    updateContexto: ContextoController.update,
    //Roles
    setRols: UsuarioController.rols.set,
};
