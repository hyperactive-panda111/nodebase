'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormDescription,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    FormField
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';


const formSchema = z.object({
    variableName: z
    .string()
    .min(1, { message: 'Variable name is required'})
    .regex(/^[a-zA-Z_$][A-Za-z0-9_$]*$/, {
        message: 'Variable name must start with a letter or underscore and contain only letters, numbers and underscores.'
    }),
    username: z.string().optional(),
    content:  z
        .string()
        .min(1, 'Message content is required')
        .max(2000, 'Discord messages cannot exceed 2000 characters'),
    webhookUrl: z.string().min(1, 'Webhook URL is required'),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<DiscordFormValues>;
};

export const DiscordDialog = ({
    open, 
    onOpenChange,
    onSubmit,
    defaultValues = {},
 }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || '',
            username: defaultValues.username || '',
            content: defaultValues.content || '',
            webhookUrl: defaultValues.webhookUrl || '',
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(()=>{
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || '',
                username: defaultValues.username || '',
                content: defaultValues.content || '',
                webhookUrl: defaultValues.webhookUrl || '',
            });
        };
    },[open, defaultValues, form]);

    const watchVariableName = form.watch('variableName') || 'myDiscord';

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        console.log('Form values: ', values);
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discord Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the Discord webhook settings for this node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-8 mt-4'
                    >
                        <FormField
                            control={form.control}
                            name='variableName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={watchVariableName}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to reference the result in other nodes: {' '}
                                        {`{{${watchVariableName}.text}}`}
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="webhookUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Webhook URL</FormLabel>
                                    <FormControl>
                                        <Input 
                                          placeholder='https://discord.com/api/webhooks/...'
                                          {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Get this Discord: Channel Settings → Integrations → Webhooks
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            <FormField
                                name='content'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message Content</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className='min-h-[80px] font-mono text-sm'
                                                placeholder={`Summary: {{myGemini.text}}`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The message to send. Use {"{{variables}}"} for simple values or
                                            {" {{json variable}}"} to stringify objects
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bot Username (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Workflow Bot'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Overide the webhook's default username
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className='mt-4'>
                            <Button type='submit'>Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};