import Handlebars from 'handlebars';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { geminiChannel } from '@/inngest/channels/gemini';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type geminiData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<geminiData> = async ({
    data,
    nodeId,
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

    if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Gemini node: User prompt is missing');
    };

    //TODO: Throw if credential is missing

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : 'You are a helpful assistant';
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    // TODO: Fetch credentials that user selected

    const credentials = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    const google = createGoogleGenerativeAI({
        apiKey: credentials,
        
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