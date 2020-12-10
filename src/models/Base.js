import { Schema, model } from "mongoose";

const schemaBase = new Schema({
    base_esp: {
        type: String,
        required: true,
    },
    base_zap: {
        type: String,
        required: true,
    },
    significado: {
        type: String,
        required: true,
    },
});

const modelBase = model("Base", schemaBase, "bases");

export default modelBase;
