import { Schema, model } from "mongoose";

const exampleSchema = new Schema({
    texto: {
        type: String,
    },
    ejemplo_esp: {
        type: String,
    },
    ejemplo_zap: {
        type: String,
    },
});

const exampleModel = model("Example", exampleSchema, "ejemplos");

export default exampleModel;
