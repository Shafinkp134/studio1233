
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

    async function placeOrder(values: CheckoutFormValues, imageUrl?: string) {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Database not available.",
            });
            return false;
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
                paymentScreenshotUrl: imageUrl || null,
            });
            
            toast({
                title: "Order Placed!",
                description: "Thank you for your purchase. Please complete the payment.",
            });
            
            return true;

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error placing order",
                description: error.message || "Could not place the order.",
            });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleWhatsAppPay = async () => {
        const isValid = await form.trigger();
        if (!isValid) {
            toast({
                variant: "destructive",
                title: "Invalid Details",
                description: "Please fill out all the required fields correctly.",
            });
            return;
        }
        
        const values = form.getValues();
        let imageUrl: string | undefined;

        const paymentScreenshotFile = values.paymentScreenshot?.[0];

        if (paymentScreenshotFile) {
            setIsSubmitting(true);
            const uploadedUrl = await uploadImage(paymentScreenshotFile);
            setIsSubmitting(false);
            if (!uploadedUrl) {
                // Error toast is shown in uploadImage function
                return;
            }
            imageUrl = uploadedUrl;
        }

        const orderPlaced = await placeOrder(values, imageUrl);

        if (orderPlaced) {
            const whatsAppNumber = "8590814673";
            const message = `Hi, I've just placed an order on MrShopiy.
            \nName: ${values.customerName}
            \nOrder Total: ₹${cartTotal.toFixed(2)}
            \nI would like to complete the payment.`;
            const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
            
            clearCart();
            window.open(whatsappUrl, '_blank');
            router.push('/');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Please provide your details to complete the order.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                                    <FormLabel>Payment Screenshot</FormLabel>
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
                             <Button onClick={handleWhatsAppPay} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" disabled={isSubmitting}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M12.01 2.01a10.02 10.02 0 0 0-8.2 13.43l-1.2 4.38 4.5-1.18A9.95 9.95 0 0 0 12.01 22a10 10 0 0 0 0-20z"/><path d="M17.15 14.36c-.47-.24-2.78-1.37-3.21-1.52s-.76-.23-1.08.23c-.32.47-1.22 1.52-1.49 1.83s-.54.35-1 .12-2.11-.78-4-2.47c-1.48-1.32-2.49-2.95-2.78-3.45s-.3-.76-.07-1c.21-.21.47-.54.71-.81.24-.27.32-.47.47-.78s0-.54-.07-.78-.92-2.2-.92-2.2c-.37-.93-1.08-1.08-1.49-1.08-.32 0-.76.07-1.15.46s-1.49 1.4-1.49 3.45c0 2.05 1.52 4 1.75 4.28s2.95 4.49 7.22 6.32c3.55 1.52 4.26 1.22 4.84.83.58-.39.92-1.37.92-1.37s.24-.24.12-.47z"/></svg>
                                {isSubmitting ? "Processing..." : "Pay with WhatsApp"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
