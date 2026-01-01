
"use client";

import { useState, useEffect } from "react";
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

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a valid address"),
  transactionId: z.string().min(4, "Transaction ID is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
    const { toast } = useToast();
    const { cartItems, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            customerName: "",
            email: "",
            phone: "",
            address: "",
            transactionId: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.setValue("customerName", user.displayName || "");
            form.setValue("email", user.email || "");
        }
    }, [user, form]);

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
            });
            
            toast({
                title: "Order Placed!",
                description: "We have received your order. Please send the payment to 8590814673 via your preferred payment app.",
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
                        
                        <div className="space-y-4 pt-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Please complete your payment to <span className="font-semibold text-foreground">8590814673</span> via your preferred payment app and enter the transaction ID below.
                            </p>
                            <FormField control={form.control} name="transactionId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transaction ID</FormLabel>
                                    <FormControl><Input placeholder="Enter your payment transaction ID" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? "Placing Order..." : "Place Order"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
