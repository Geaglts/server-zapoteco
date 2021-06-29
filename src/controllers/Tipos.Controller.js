import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default {
  async create(parent, { tipo }, context) {
    try {
      // Ver si el tipo existe
      const tipoExiste = await prisma.tipos.findFirst({
        where: {
          tipo: tipo.toLowerCase(),
        },
      });

      if (tipoExiste) {
        return { status: false, msg: 'El tipo ya existe' };
      }

      // Nuevo tipo
      await prisma.tipos.create({
        data: { tipo: tipo.toLowerCase() },
      });

      return { status: true, msg: 'Creado correctamente' };
    } catch (err) {
      throw new Error(err);
    }
  },
  async read(parent, args, context) {
    try {
      // Todos los tipos
      const tipos = await prisma.tipos.findMany();
      return tipos;
    } catch (err) {
      throw new Error(err);
    }
  },
  async update(parent, { id, tipo }, context) {
    try {
      // Actualizar un tipo
      await prisma.tipos.update({
        where: { id },
        data: { tipo: tipo.toLowerCase() },
      });

      return { status: true, msg: 'Actualizado correctamente' };
    } catch (err) {
      throw new Error(err);
    }
  },
};
