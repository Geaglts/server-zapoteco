import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default {
  async create(parent, { contexto }, context) {
    try {
      //Ver si el contexto existe
      const contextoExiste = await prisma.contextos.findFirst({
        where: {
          contexto: contexto.toLowerCase(),
        },
      });

      if (contextoExiste)
        return { status: true, msg: 'La categoria ya existe' };

      // Nuevo contexto
      const nuevoContexto = await prisma.contextos.create({
        data: {
          contexto: contexto.toLowerCase(),
        },
      });

      return nuevoContexto;
    } catch (err) {
      throw new Error(err);
    }
  },
  async read(parent, args, context) {
    try {
      // Todos los contextos
      const contextos = await prisma.contextos.findMany({
        orderBy: {
          contexto: 'asc',
        },
      });
      return contextos;
    } catch (err) {
      throw new Error(err);
    }
  },
  async update(parent, { id, contexto }, context) {
    try {
      // Actualizar un contexto
      const contextoActualizado = await prisma.contextos.update({
        where: {
          id,
        },
        data: {
          contexto: contexto.toLowerCase(),
        },
      });

      return contextoActualizado;
    } catch (err) {
      throw new Error(err);
    }
  },
};
