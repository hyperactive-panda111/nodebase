import Handlebars from 'handlebars';
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { httpRequestChannel } from '../../../../inngest/channels/http-request';

Handlebars.registerHelper('json', (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type HttpRequestData = {
    variableName: string;
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    // Publish 'loading' state for http request
    await publish(
        httpRequestChannel().status({
            nodeId,
            status: 'loading',
        }),
    );
 
    if (!data.endpoint) {
        // Publish 'error' state for http request
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('HTTP Request node: No endpoint configured');
    };

    if (!data.variableName) {
        // Publish 'error' state for http request
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Variable name not configured');
    }

    if (!data.method) {
        // Publish 'error' state for http request
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: 'error',
            }),
        );

        throw new NonRetriableError('Method not configured');
    }


    try {
        const result = await step.run('http-request', async () => {
            const endpoint = Handlebars.compile(data.endpoint)(context);
            console.log('ENDPOINT', { endpoint });
            const method = data.method;

            const options: KyOptions = { method };

            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                const resolved = Handlebars.compile(data.body || '{}')(context);
                console.log(resolved);
                JSON.parse(resolved);
                options.body = resolved;
                options.headers = {
                    'Content-Type': 'application/json',
                };

            };

            const response = await ky(endpoint, options);
            const contentType = response.headers.get('content-type');
            const responseData = contentType?.includes('application/json')
                ? await response.json()
                : await response.text();
            const responsePayload = {
                httpResponse: {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData,
                },
            };

            return {
                ...context,
                [data.variableName]: responsePayload,
            };
        });

        //TODO: Publish 'success' state for http request
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: 'success',
            }),
        );
        return result;
    } catch (error) {
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: 'error',
            }));

        throw error;

    }

};