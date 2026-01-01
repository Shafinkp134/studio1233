import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { StarRating } from "./star-rating";
import { AddToCartButton } from "./add-to-cart-button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const placeholder = getPlaceholderImage(product.image);

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/product/${product.id}`} className="block">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={placeholder.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={placeholder.imageHint}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg leading-tight mb-2">
           <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-sm text-muted-foreground">({product.reviews.length})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
