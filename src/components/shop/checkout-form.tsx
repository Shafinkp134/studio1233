"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useFirestore, useUser } from "@/firebase";

export function CheckoutForm() {
    const { toast } = useToast();
    const { cartItems, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    async function placeOrder() {
        if (!firestore || !user || !user.email) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "You must be logged in to place an order.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const ordersCollection = collection(firestore, "orders");
            await addDoc(ordersCollection, {
                customerName: user.displayName || user.email,
                email: user.email,
                date: new Date().toISOString(),
                status: 'Processing',
                total: cartTotal,
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            });
            
            toast({
                title: "Order Placed!",
                description: "Thank you for your purchase. This is a development order.",
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
                <CardTitle>Development Checkout</CardTitle>
                <CardDescription>Click the button below to simulate an order.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Button onClick={placeOrder} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Placing Order..." : "Place Development Order"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
