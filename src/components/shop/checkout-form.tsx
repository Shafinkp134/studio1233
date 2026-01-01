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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  zip: z.string().min(4),
  country: z.string().min(2),
  cardName: z.string().min(2),
  cardNumber: z.string().regex(/^(?:\d{4} ?){3}\d{4}$/, "Invalid card number"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\s?\/\s?([2-9][0-9])$/, "Invalid expiry date (MM / YY)"),
  cardCvc: z.string().regex(/^\d{3,4}$/, "Invalid CVC"),
});

export function CheckoutForm() {
    const { toast } = useToast();
    const { clearCart } = useCart();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "", name: "", address: "", city: "", zip: "", country: "",
            cardName: "", cardNumber: "", cardExpiry: "", cardCvc: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form submitted:", values);
        toast({
            title: "Order Placed!",
            description: "Thank you for your purchase. A confirmation has been sent to your email.",
        });
        clearCart();
        router.push('/');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment & Shipping</CardTitle>
                <CardDescription>Enter your details to complete the purchase.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Information</h3>
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Shipping Address</h3>
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="zip" render={({ field }) => (
                                    <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="country" render={({ field }) => (
                                    <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Payment Details</h3>
                            <FormField control={form.control} name="cardName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name on Card</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="cardNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Card Number</FormLabel>
                                    <FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="cardExpiry" render={({ field }) => (
                                    <FormItem><FormLabel>Expiry (MM / YY)</FormLabel><FormControl><Input placeholder="MM / YY" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="cardCvc" render={({ field }) => (
                                    <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>
                        
                        <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Processing..." : "Pay Now"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
