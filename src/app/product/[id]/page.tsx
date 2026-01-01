"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { StarRating } from '@/components/shop/star-rating';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDocument } from '@/firebase/firestore/use-doc';
import type { Product } from '@/lib/types';
import { useMemo } from 'react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { id } = params;

    const productRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'products', id);
    }, [firestore, id]);

    const { data: product, loading } = useDocument<Product>(productRef);

    if (loading) {
        return <div className="container mx-auto px-4 py-12 text-center">Loading product...</div>;
    }

    if (!product) {
        notFound();
    }

    const placeholder = getPlaceholderImage(product.image);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="relative aspect-square w-full max-w-md mx-auto">
                    <Card className="overflow-hidden shadow-lg">
                        <Image
                            src={placeholder.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            data-ai-hint={placeholder.imageHint}
                            priority
                        />
                    </Card>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <Badge variant="secondary">{product.brand}</Badge>
                        <Badge variant="outline">{product.type}</Badge>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
                    <div className="flex items-center gap-2">
                        <StarRating rating={product.rating || 0} />
                        <span className="text-muted-foreground">{product.rating?.toFixed(1) || '0.0'} ({product.reviews?.length || 0} reviews)</span>
                    </div>
                    <p className="text-muted-foreground text-lg">{product.description}</p>
                    
                    <ul className="space-y-2 mt-4">
                        {product.features?.map(feature => (
                            <li key={feature} className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-accent" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-baseline gap-4 mt-4">
                        <span className="text-4xl font-bold">₹{product.price.toFixed(2)}</span>
                        <AddToCartButton product={product} size="lg" className="w-full max-w-xs">
                            Add to Cart
                        </AddToCartButton>
                    </div>
                </div>
            </div>

            <Separator className="my-12" />

            <div>
                <h2 className="text-2xl font-bold mb-6 font-headline">Customer Reviews</h2>
                <div className="space-y-6">
                    {product.reviews && product.reviews.length > 0 ? product.reviews.map(review => (
                        <Card key={review.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{review.author}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{review.text}</p>
                            </CardContent>
                        </Card>
                    )) : (
                        <p className="text-muted-foreground">No reviews yet for this product.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
