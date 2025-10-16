import prisma from '@/lib/db';
import { createTRPCRouter,protectedProcedure } from '../init';
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
      console.log({ userId: ctx.auth.user.id });
      return prisma.user.findMany();
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;