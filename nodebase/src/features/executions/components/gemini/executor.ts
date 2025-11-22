import Handlebars from 'handlebars';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { geminiChannel } from '@/inngest/channels/gemini';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import prisma from '@/lib/db';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type geminiData = {
    variableName?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<geminiData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state for http request
    await publish(
        geminiChannel().status({
            nodeId,
            status: 'loading',
        }),
    );

    if (!data.variableName) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Gemini node: Variable name is missing');
    };

    if (!data.credentialId) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Gemini node: Credential is required');
    };

    if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Gemini node: User prompt is missing');
    };

    

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : 'You are a helpful assistant';
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    

    const credential = await step.run('get-credential', async () => {
        
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
                userId,
            },
        });
    });

    if (!credential) {
        throw new NonRetriableError('Credential not found');
    }

    const google = createGoogleGenerativeAI({
        apiKey: credential.value,
        
    });

    try {
        const { steps } = await step.ai.wrap(
            'gemini-generate-text',
            generateText,
            {
                model: google('gemini-2.0-flash'),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                },
            },
        );

        const text = 
            steps[0].content[0].type === 'text'
            ? steps[0].content[0].text
            : '';
        
        await publish(
            geminiChannel().status({
                nodeId,
                status: 'success',
            }),
        );

        return {
            ...context,
            [data.variableName]: {
                 text,
            },
        }
    } catch (error) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw error;
    };
}