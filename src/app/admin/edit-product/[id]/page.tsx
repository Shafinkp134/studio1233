"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useDocument } from "@/firebase/firestore/use-doc";
import type { Product } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  brand: z.enum(['Apple', 'Samsung', 'Anker', 'Generic', 'Nothing']),
  type: z.enum(['Case', 'Charger', 'Cable', 'Screen Protector', 'Phone']),
  image: z.string().min(1, "Image ID is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'products', id);
  }, [firestore, id]);

  const { data: product, loading: productLoading } = useDocument<Product>(productRef);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
    }
  }, [product, form]);

  async function onSubmit(values: ProductFormValues) {
    if (!firestore || !productRef) {
        toast({ variant: "destructive", title: "Firestore not available" });
        return;
    }
    setIsSubmitting(true);
    try {
        await updateDoc(productRef, values);

        toast({
            title: "Product Updated!",
            description: `${values.name} has been updated.`,
        });
        router.push('/admin');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error updating product",
            description: error.message || "Could not update the product.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  if (productLoading) {
      return <div className="container mx-auto px-4 py-12 text-center">Loading product details...</div>
  }
  
  if (!product) {
      return <div className="container mx-auto px-4 py-12 text-center">Product not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>Update the details for &quot;{product.name}&quot;.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input placeholder="e.g., iPhone 15 Pro Case" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the product..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </Ite