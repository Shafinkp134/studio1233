export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: 'Apple' | 'Samsung' | 'Anker' | 'Generic' | 'Nothing';
  type: 'Case' | 'Charger' | 'Cable' | 'Screen Protector' | 'Phone';
  rating: number;
  reviews: Review[];
  features: string[];
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    date: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: number;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
};
