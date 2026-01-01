"use client";

import { useCart } from "@/context/cart-context";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { cartItems, cartTotal, itemCount } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (itemCount === 0) {
            router.push('/');
        }
    }, [itemCount, router]);

    if (itemCount === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p>Redirecting to homepage...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center font-headline">Checkout</h1>
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.product.id} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                        <Image src={getPlaceholderImage(item.product.image).imageUrl} alt={item.product.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <p>Total</p>
                                <p>₹{cartTotal.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <CheckoutForm />
                </div>
            </div>
        </div>
    );
}
