import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from '@/lib/db';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    trustedOrigins: ['https://3000-firebase-nodebase-1760493652353.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev'],

});