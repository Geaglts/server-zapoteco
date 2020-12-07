import { Schema, model } from "mongoose";

const significadoSchema = new Schema({
    significado: {
        type: String,
    },
});

const significadoModel = model(
    "Significado",
    significadoSchema,
    "significados"
);

export default significadoModel;
