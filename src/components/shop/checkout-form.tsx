
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
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useFirestore, useUser } from "@/firebase";
import { Phone } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
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
        },
    });

    useEffect(() => {
        if (user) {
            form.setValue("customerName", user.displayName || "");
            form.setValue("email", user.email || "");
        }
    }, [user, form]);

    async function placeOrder(values: CheckoutFormValues) {
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
                customerName: values.customerName,
                email: values.email,
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
                description: "Thank you for your purchase.",
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
                    <form onSubmit={form.handleSubmit(placeOrder)} className="space-y-6">
                        <FormField control={form.control} name="customerName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input placeholder="Jane Doe" {...field} disabled={!!user} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input type="email" placeholder="you@example.com" {...field} disabled={!!user} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <div className="space-y-4">
                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? "Placing Order..." : "Place Order"}
                            </Button>
                            <Button variant="outline" className="w-full" size="lg" disabled={isSubmitting} onClick={form.handleSubmit(placeOrder)}>
                                <Phone className="mr-2 h-4 w-4" /> Pay with PhonePe
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
