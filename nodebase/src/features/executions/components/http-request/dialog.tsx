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
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent
} from '@/components/ui/select';
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
    endpoint: z.url({ message: 'Please enter a valid URL' }),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    body: z
        .string()
        .optional()
        //.refine()

});

export type HttpRequestFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<HttpRequestFormValues>;
};

export const HttpRequestDialog = ({
    open, 
    onOpenChange,
    onSubmit,
    defaultValues = {},
 }: Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || '',
            endpoint: defaultValues.endpoint || '',
            method: defaultValues.method || 'GET',
            body: defaultValues.body || '',
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(()=>{
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || '',
                endpoint: defaultValues.endpoint || '',
                method: defaultValues.method || 'GET',
                body: defaultValues.body || '',
            })
        }
    },[open, defaultValues, form]);

    const watchVariableName = form.watch('variableName') || 'myApiCall';
    const watchMethod = form.watch('method');
    const showBodyField = ['POST', 'PUT', 'PATCH'].includes(watchMethod);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        console.log('Form values: ', values);
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>HTTP Request</DialogTitle>
                    <DialogDescription>
                        Configure settings for the HTTP Request node.
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
                                        {`{{${watchVariableName}.httpResponse.data}}`}
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='method'
                            render={({ field }) => (

                                <FormItem>
                                    <FormLabel>Method</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select a method'/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='GET'>GET</SelectItem>
                                            <SelectItem value='POST'>POST</SelectItem>
                                            <SelectItem value='PUT'>PUT</SelectItem>
                                            <SelectItem value='PATCH'>PATCH</SelectItem>
                                            <SelectItem value='DELETE'>DELETE</SelectItem>
                                        </SelectContent> 
                                    </Select>
                                    <FormDescription>
                                        The HTTP method to use for this request
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='endpoint'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endpoint URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='https://api.example.com/users/{{httpResponse.data.id}}'
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Static URL or use {"{{variables}}"} for simple values or
                                        {" {{json variable}}"} to stringify objects
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        {showBodyField && (
                            <FormField
                                name='body'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Request Body</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className='min-h-[120px] font-mono text-sm'
                                                placeholder={`{
                                                    "userId": "{{httpResponse.data.id}}",
                                                    "name": "{{httpResponse.data.name}}",
                                                    "items": "{{httpResponse.data.items}}"
                                                \n}`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            JSON with template variables. Use {"{{variables}}"} for simple values or
                                            {" {{json variable}}"} to stringify objects
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <DialogFooter className='mt-4'>
                            <Button type='submit'>Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};