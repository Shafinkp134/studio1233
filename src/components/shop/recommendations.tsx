
"use server";

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-accessory-recommendations';
import { ProductCard } from './product-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Product } from '@/lib/types';


async function getProductsFromFirestore(ids: string[] = [], count: number = 5): Promise<Product[]> {
    const { firestore } = initializeFirebase();
    const productsCol = collection(firestore, 'products');
    let products: Product[] = [];

    if (ids.length > 0) {
        // Firestore 'in' query is limited to 30 elements.
        const productChunks = [];
        for (let i = 0; i < ids.length; i += 30) {
            productChunks.push(ids.slice(i, i + 30));
        }
        try {
            for (const chunk of productChunks) {
                if (chunk.length > 0) {
                    const q = query(productsCol, where('__name__', 'in', chunk));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        products.push({ id: doc.id, ...doc.data() } as Product);
                    });
                }
            }
        } catch (e) {
            console.log("Error fetching products by ID, falling back to recent", e);
            products = []; // Clear out partial results
        }
    }
    
    // If after fetching by IDs we still don't have enough products, fetch recent ones.
    if (products.length < count) {
        const needed = count - products.length;
        const q = query(productsCol, limit(needed));
        const querySnapshot = await getDocs(q);
        const fallbackProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
            // Avoid adding duplicates if some products were already fetched by ID
            if (!products.some(p => p.id === doc.id)) {
                 fallbackProducts.push({ id: doc.id, ...doc.data() } as Product);
            }
        });
        products = [...products, ...fallbackProducts];
    }
    
    return products.slice(0, count);
}


export async function Recommendations() {
  /*
  const recommendationsInput = {
    userId: 'user-123',
    browsingHistory: ['case-samsung-s23', 'charger-anker-pd'],
    purchaseHistory: ['cable-apple-lightning'],
    userCharacteristics: 'Owns an iPhone 14 Pro and a Samsung Galaxy S23. Tech enthusiast who values fast charging and durability.'
  };
  */

  let recommendedProducts: Product[] = [];
  try {
    // const result = await getPersonalizedRecommendations(recommendationsInput);
    // const recommendedIds = result.recommendedProducts;
    // recommendedProducts = await getProductsFromFirestore(recommendedIds, 5);
    recommendedProducts = await getProductsFromFirestore([], 5);

  } catch (error) {
    console.error("Error fetching AI recommendations, falling back to recent products:", error);
    // Fallback to showing recent products on any error
    recommendedProducts = await getProductsFromFirestore([], 5);
  }
  
  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-8 text-center font-headline">You Might Also Like</h2>
        <Carousel 
          opts={{ align: "start", loop: true }} 
          className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {recommendedProducts.map(product => (
              <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  )
}
