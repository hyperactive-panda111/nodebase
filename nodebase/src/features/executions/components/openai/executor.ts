import Handlebars from 'handlebars';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { openaiChannel } from '@/inngest/channels/openai';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type OpenAiData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAiData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state for http request
    await publish(
       openaiChannel().status({
            nodeId,
            status: 'loading',
        }),
    );

    if (!data.variableName) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Gemini node: Variable name is missing');
    };

    if (!data.userPrompt) {
        await publish(
            openaiChannel().status({
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

    const credentials = process.env.OPENAI_API_KEY;

    const openai = createOpenAI({
        apiKey: credentials,
        
    });

    try {
        const { steps } = await step.ai.wrap(
            'gemini-generate-text',
            generateText,
            {
                model: openai('gpt-4'),
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
            openaiChannel().status({
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
            openaiChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw error;
    };
}