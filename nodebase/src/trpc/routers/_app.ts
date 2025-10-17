import prisma from '@/lib/db';
import { createTRPCRouter,protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  getWorflows: protectedProcedure.query(({ ctx }) => {
      console.log({ userId: ctx.auth.user.id });
      return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: 'test/hello.world',
      data: {
        email: 'test@ndc.com',
      },
    })
    return prisma.workflow.create({
      data: {
        name: 'test-workflow',
      },
    });
  }),
  
});
// export type definition of API
export type AppRouter = typeof appRouter;