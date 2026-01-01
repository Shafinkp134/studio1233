"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";
import { useUser } from "@/firebase";

interface AddToCartButtonProps {
    product: Product;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    children?: React.ReactNode;
}

const ADMIN_EMAIL = "shafinkp444@gmail.com";

export function AddToCartButton({ product, children, ...props }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const { user, loading } = useUser();

    if (loading) {
        return <Button disabled {...props}><div className="h-5 w-12 animate-pulse rounded-md bg-muted-foreground/50" /></Button>;
    }
    
    if (!user || user.email !== ADMIN_EMAIL) {
        return null;
    }
    
    return (
        <Button onClick={() => addToCart(product)} {...props}>
            {children || <ShoppingCart className="h-4 w-4" />}
        </Button>
    )
}
