import { PrismaClient } from "@prisma/client";
import {
    CategoriasController,
    ContextoController,
    TiposController,
    UsuarioController,
    PalabraController,
    BaseController,
} from "../../controllers";

const prisma = new PrismaClient();

export default {
    async getRols(parent, args, { user }) {
        try {
            if (!user) throw new Error("Not Authorized");

            const rols = await prisma.roles.findMany();

            return rols;
        } catch (err) {
            throw new Error(err);
        }
    },
    async aboutMe(parent, args, { user }) {
        try {
            if (!user) throw new Error("Not Authorized");

            let userExists = await prisma.usuarios.findOne({
                where: {
                    id: user.id,
                },
            });

            delete userExists.contrasena;

            return userExists;
        } catch (err) {
            throw new Error(err);
        }
    },
    async myRoles(parent, args, { user }) {
        try {
            if (!user) throw new Error("Not Authorized");

            let usuario = await prisma.usuarios.findOne({
                where: { id: user.id },
                select: {
                    admin: true,
                    roles: {
                        select: {
                            rol: {
                                select: {
                                    rol: true,
                                },
                            },
                        },
                    },
                },
            });

            return usuario.roles.map(({ rol }) => rol.rol);
        } catch (err) {
            throw new Error(err);
        }
    },
    async getWords(parent, args, context) {
        try {
            let palabras = await prisma.palabras_aprobadas.findMany({
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
            });

            palabras = palabras.map((palabra) => {
                if (palabra.traducciones.length > 0) {
                    let traducciones = palabra.traducciones.map(
                        ({ traduccion }) => traduccion
                    );

                    palabra = { ...palabra, traducciones };
                }
                if (palabra.contextos.length > 0) {
                    let contextos = palabra.contextos.map(
                        ({ contexto }) => contexto
                    );

                    palabra = { ...palabra, contextos };
                }
                return palabra;
            });

            return palabras;
        } catch (err) {
            throw new Error(err);
        }
    },
    // Palabras pendientes
    getPendingWords: PalabraController.pendingWords.read,
    // Usuarios
    getUser: UsuarioController.readOne,
    verifiedWords: UsuarioController.verifier.approved,
    approvedWords: UsuarioController.words.approved,
    pendingWords: UsuarioController.words.pendign,
    rejectedWords: UsuarioController.words.rejected,
    // Tipos
    getTypes: TiposController.read,
    // Categorias
    getCategories: CategoriasController.read,
    // Contexto
    getContextos: ContextoController.read,
    // Bases
    allTheBases: BaseController.read,
};
