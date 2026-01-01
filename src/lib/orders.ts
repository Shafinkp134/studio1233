import type { Order } from './types';

export const orders: Order[] = [
  {
    id: 'ORD001',
    customer: 'Liam Johnson',
    email: 'liam@example.com',
    date: '2024-07-29',
    status: 'Shipped',
    total: 2199.00,
    items: [
      { productId: 'case-iphone-15', quantity: 1, price: 2075 },
    ]
  },
  {
    id: 'ORD002',
    customer: 'Olivia Smith',
    email: 'olivia@example.com',
    date: '2024-07-28',
    status: 'Processing',
    total: 6225.00,
    items: [
      { productId: 'charger-anker-pd', quantity: 1, price: 6225.00 },
    ]
  },
  {
    id: 'ORD003',
    customer: 'Noah Brown',
    email: 'noah@example.com',
    date: '2024-07-28',
    status: 'Delivered',
    total: 7470.00,
    items: [
      { productId: 'charger-samsung-wireless', quantity: 1, price: 7470.00 },
    ]
  },
  {
    id: 'ORD004',
    customer: 'Emma Jones',
    email: 'emma@example.com',
    date: '2024-07-27',
    status: 'Shipped',
    total: 4649.00,
    items: [
        { productId: 'case-samsung-s23', quantity: 1, price: 3320.00 },
        { productId: 'cable-anker-usbc', quantity: 1, price: 1329.00 },
    ]
  },
    {
    id: 'ORD005',
    customer: 'James Wilson',
    email: 'james@example.com',
    date: '2024-07-26',
    status: 'Cancelled',
    total: 1080.00,
    items: [
        { productId: 'sp-iphone-15', quantity: 1, price: 1080.00 },
    ]
  },
];
