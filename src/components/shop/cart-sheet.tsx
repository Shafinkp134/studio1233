"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { Separator } from "../ui/separator";

export function CartSheet() {
  const { cartItems, itemCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {itemCount > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-6 pr-6">
                {cartItems.map((item) => {
                  const placeholder = getPlaceholderImage(item.product.image);
                  return (
                    <div key={item.product.id} className="flex items-start gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-md">
                        <Image
                          src={placeholder.imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          data-ai-hint={placeholder.imageHint}
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/product/${item.product.id}`} className="font-semibold hover:underline">
                           <SheetClose>{item.product.name}</SheetClose>
                        </Link>
                        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                           <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeFromCart(item.product.id)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 bg-secondary/50">
              <div className="flex w-full flex-col gap-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/30" strokeWidth={1}/>
            <p className="text-muted-foreground">Your cart is empty.</p>
            <SheetClose asChild>
                <Button variant="link">Start Shopping</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
