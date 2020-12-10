import Base from "../models/Base";

export default {
    create: async (parent, { input }, context) => {
        try {
            let { id, ...otherInputs } = input;

            // Busca si la base ya existe
            const baseExists = await Base.findOne({
                base_esp: otherInputs.base_esp,
            });

            if (baseExists) return null;

            // Si no existe lo agrega
            const newBase = new Base(otherInputs);
            newBase.save();

            return newBase;
        } catch (err) {
            throw new Error(err);
        }
    },
    read: async (parent, args, context) => {
        try {
            return await Base.find();
        } catch (err) {
            throw new Error(err);
        }
    },
    update: async (parent, { input }, context) => {
        try {
            let { id, ...otherInputs } = input;
            // Actuzaliza la base
            const updatedBase = await Base.findByIdAndUpdate(id, otherInputs);
            // Retorna la base
            return updatedBase;
        } catch (err) {
            throw new Error(err);
        }
    },
};

/*
update: async (parent, args, context) => {
    try {
    } catch (err) {
        throw new Error(err);
    }
},
*/
