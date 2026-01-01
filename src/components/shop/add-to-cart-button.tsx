
"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
    product: Product;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    children?: React.ReactNode;
}

export function AddToCartButton({ product, children, ...props }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    
    return (
        <Button onClick={() => addToCart(product)} {...props}>
            {children || <ShoppingCart className="h-4 w-4" />}
        </Button>
    )
}
