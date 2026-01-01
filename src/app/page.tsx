
import { ProductCatalog } from '@/components/shop/product-catalog';
import { Recommendations } from '@/components/shop/recommendations';
import { initializeFirebase } from '@/firebase';
import type { Product } from '@/lib/types';
import { collection, getDocs, query, limit } from 'firebase/firestore';

async function getProducts(): Promise<Product[]> {
  const { firestore } = initializeFirebase();
  const productsCol = collection(firestore, "products");
  const q = query(productsCol);
  const querySnapshot = await getDocs(q);
  const products: Product[] = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() } as Product);
  });
  return products;
}

export default async function Home() {
  const products = await getProducts();

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
      
      {products && <ProductCatalog allProducts={products} />}

      <Recommendations />
    </div>
  );
}
