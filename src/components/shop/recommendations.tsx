"use server";

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-accessory-recommendations';
import { products } from '@/lib/data';
import { ProductCard } from './product-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export async function Recommendations() {
  const recommendationsInput = {
    userId: 'user-123',
    browsingHistory: ['case-samsung-s23', 'charger-anker-pd'],
    purchaseHistory: ['cable-apple-lightning'],
    userCharacteristics: 'Owns an iPhone 14 Pro and a Samsung Galaxy S23. Tech enthusiast who values fast charging and durability.'
  };

  let recommendedProducts = [];
  try {
    const result = await getPersonalizedRecommendations(recommendationsInput);
    const recommendedIds = result.recommendedProducts;
    
    // Find the full product objects from our mock data
    const foundProducts = products.filter(p => recommendedIds.includes(p.id));

    // To ensure we have some products, combine with a fallback
    const fallbackProducts = products.filter(p => !recommendedIds.includes(p.id));
    recommendedProducts = [...foundProducts, ...fallbackProducts].slice(0, 5);

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Fallback to showing first 5 products on error
    recommendedProducts = products.slice(0, 5);
  }
  
  if (recommendedProducts.length === 0) {
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
