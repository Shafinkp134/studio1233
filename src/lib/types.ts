export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: 'Apple' | 'Samsung' | 'Anker' | 'Generic';
  type: 'Case' | 'Charger' | 'Cable' | 'Screen Protector';
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
