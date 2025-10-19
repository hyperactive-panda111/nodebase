import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from '@/lib/db';
import { polarClient } from './polar'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    trustedOrigins: ['https://3000-firebase-nodebase-1760493652353.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev'],
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                products: [
                    {
                        productId: '0ab49aff-3714-40d1-a7fa-e3afe24ad5ec',
                        slug: 'nodebase',
                    }
                ],
                successUrl: process.env.POLAR_SUCCESS_URL,
                authenticatedUsersOnly: true,
            }),
             portal()]
        }),
    ]

});