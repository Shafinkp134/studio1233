
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useFirestore, useUser } from "@/firebase";
import { Upload } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a valid address"),
  paymentScreenshot: z.any().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
    const { toast } = useToast();
    const { cartItems, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            customerName: "",
            email: "",
            phone: "",
            address: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.setValue("customerName", user.displayName || "");
            form.setValue("email", user.email || "");
        }
    }, [user, form]);

    async function uploadImage(file: File): Promise<string | null> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Image upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error uploading image",
                description: error.message,
            });
            return null;
        }
    }
    
    async function onSubmit(values: CheckoutFormValues) {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Database not available.",
            });
            return;
        }
        
        setIsSubmitting(true);
        let imageUrl: string | undefined;
        const paymentScreenshotFile = values.paymentScreenshot?.[0];

        if (paymentScreenshotFile) {
            const uploadedUrl = await uploadImage(paymentScreenshotFile);
            if (!uploadedUrl) {
                setIsSubmitting(false);
                return; 
            }
            imageUrl = uploadedUrl;
        }

        try {
            const ordersCollection = collection(firestore, "orders");
            await addDoc(ordersCollection, {
                ...values,
                date: new Date().toISOString(),
                status: 'Processing',
                total: cartTotal,
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                paymentScreenshotUrl: imageUrl || null,
            });
            
            toast({
                title: "Order Placed!",
                description: "Please send the payment to 8590814673 via WhatsApp.",
            });

            clearCart();
            router.push('/');

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error placing order",
                description: error.message || "Could not place the order.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Please provide your details to complete the order.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="customerName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl><Input type="tel" placeholder="+91 1234567890" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shipping Address</FormLabel>
                                <FormControl><Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <FormField
                            control={form.control}
                            name="paymentScreenshot"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Screenshot (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal text-muted-foreground"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {selectedFileName || "Upload screenshot..."}
                                            </Button>
                                            <Input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={(e) => {
                                                    field.onChange(e.target.files);
                                                    setSelectedFileName(e.target.files?.[0]?.name || null);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                             <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? "Placing Order..." : "Place Order"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
