if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
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
        const token = process.env.JSON_SECRET_TOKEN;
        const options = { expiresIn: "24h" };

        return sign({ data }, token, options);
    },
    verifyToken: (token) => {
        const jsonToken = process.env.JSON_SECRET_TOKEN;
        return verify(token, jsonToken);
    },
};
