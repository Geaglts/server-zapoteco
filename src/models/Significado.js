import { Schema, model } from 'mongoose';

const significadoSchema = new Schema({
  significado: {
    type: String,
  },
  palabra: {
    type: String,
  },
});

const significadoModel = model(
  'Significado',
  significadoSchema,
  'significados'
);

export default significadoModel;
