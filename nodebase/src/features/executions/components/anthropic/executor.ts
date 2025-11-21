import Handlebars from 'handlebars';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { anthropicChannel } from '@/inngest/channels/anthropic';
import prisma from '@/lib/db';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type anthropicData = {
    variableName?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<anthropicData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state for http request
    await publish(
        anthropicChannel().status({
            nodeId,
            status: 'loading',
        }),
    );

    if (!data.variableName) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Gemini node: Variable name is missing');
    };

    if (!data.credentialId) {
            await publish(
                anthropicChannel().status({
                    nodeId,
                    status: 'error',
                }),
            );
    
            throw new NonRetriableError('Gemini node: Credential is required');
        };
    

    if (!data.userPrompt) {
        await publish(
            anthropicChannel().status({
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

    // TODO: Fetch credentials that user selected
    const credential = await step.run('get-credential', async () => {
        
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
            },
        });
    });

    if (!credential) {
        throw new NonRetriableError('Credential not found');
    };

    const anthropic = createAnthropic({
        apiKey: credential.value,
        
    });

    try {
        const { steps } = await step.ai.wrap(
            'anthropic-generate-text',
            generateText,
            {
                model: anthropic('claude-sonnet-4-5'),
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
            anthropicChannel().status({
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
            anthropicChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw error;
    };
}