import { config } from "./config";
import { compare, genSalt, hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";

export const validateString = (item, excludes = []) => {
    let itemType = typeof item;
    let newInputs = {};
    switch (itemType) {
        case "string":
            if (item.length === 0) {
                return false;
            } else {
                return item;
            }
        case "object":
            {
                for (let value in item) {
                    if (item[value].length === 0 && !excludes.includes(value)) {
                        return false;
                    } else if (excludes.includes(value)) {
                        newInputs[value] = item[value];
                    } else {
                        newInputs[value] = item[value].toLowerCase().trim();
                    }
                }
            }
            break;
        default:
            return false;
    }

    return newInputs;
};

export const auth = {
    encryptPassword: async (password) => {
        return await hash(password, await genSalt());
    },
    comparePassword: async (password, hashPassword) => {
        return await compare(password, hashPassword);
    },
};

export const token = {
    generateToken: (data) => {
        return sign({ data }, config.jwtSecret);
    },
    verifyToken: (token) => {
        return verify(token, config.jwtSecret);
    },
};

export const verifyRoles = async (validRoles = [], userId, prisma) => {
    if (!userId) throw new Error("Not Authorized");

    let usuario = await prisma.usuarios.findUnique({
        where: { id: userId },
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

    if (usuario?.admin) return true;

    let roles = usuario.roles.map(({ rol }) => rol.rol);

    if (roles.length === 0) throw new Error("Not Authorized");

    for (let rol of validRoles) {
        if (roles.includes(rol.toLowerCase())) {
            return;
        }
    }

    throw new Error("Not Authorized");
};
