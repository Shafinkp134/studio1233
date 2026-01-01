import { ProductCatalog } from '@/components/shop/product-catalog';
import { products } from '@/lib/data';
import { Recommendations } from '@/components/shop/recommendations';

export default function Home() {
  return (
    <div>
      <section className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight lg:text-5xl">
          Elevate Your Mobile Experience
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Discover premium accessories designed to complement your devices.
        </p>
      </section>
      
      <ProductCatalog allProducts={products} />

      <Recommendations />
    </div>
  );
}
