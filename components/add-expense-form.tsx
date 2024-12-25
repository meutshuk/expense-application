"use client";

import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation'
import { TagInput } from "./tag-input";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    amount: z.coerce.number().positive({
        message: "Amount must be a positive number.",
    }),
    description: z.string().optional(),
    image: z
        .instanceof(FileList)
        .refine(
            (files) => files.length === 0 || files.length === 1,
            "Please upload one file or none."
        )
        .optional(),
});

interface Tag {
    name: string
}

export default function AddExpenseForm({ eventId, tags }: { eventId: string, tags: Tag[] }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            amount: 0,
            description: ''
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        let tags = selectedTags.map((item) => ({ name: item }));



        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("amount", values.amount.toString());
        formData.append('tags', JSON.stringify(tags))
        formData.append("description", values.description || '');
        if (values.image && values.image.length > 0) {
            formData.append("image", values.image[0]); // Add the image file
        }

        const response = await fetch(`/api/events/${eventId}/expenses`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            setIsSubmitting(false);
            form.reset();
            form.setValue("image", undefined);

            throw new Error("Failed to add expense");
        }

        setIsSubmitting(false);
        toast({
            title: "Expense added",
            description: "Your expense has been successfully added.",
        });
        form.reset();

        // TODO: figureo out other way to do refresh. maybe concat the
        router.refresh()

    }

    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Expense name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Expense description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <TagInput availableTags={tags} selectedTags={selectedTags} onTagsChange={setSelectedTags} />
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>Image (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*,android/force-camera-workaround"
                                    onChange={(e) => onChange(e.target.files)}
                                    {...rest}
                                />
                            </FormControl>
                            <FormDescription>
                                Upload an image of your expense (optional)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='w-full' disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
            </form>
        </Form>



    );
}
