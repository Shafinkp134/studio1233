
"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Truck, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, doc, deleteDoc } from "firebase/firestore";
import type { Product, Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const ADMIN_EMAIL = "shafinkp444@gmail.com";

export default function AdminPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);
  
  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "orders");
  }, [firestore]);

  const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (!userLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const handleDeleteProduct = async (productId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "products", productId));
      toast({
        title: "Product Deleted",
        description: "The product has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: error.message || "Could not delete the product.",
      });
    }
  };

  if (userLoading || productsLoading || ordersLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading or redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 font-headline">Orders</h1>
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Products</CardTitle>
                <Button asChild>
                  <Link href="/admin/add-product">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Reviews
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products && products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.image}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ₹{product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.reviews.length}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/edit-product/${product.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders && orders.length > 0 ? orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 hidden sm:flex">
                                <AvatarImage src={`https://avatar.vercel.sh/${order.email}.png`} alt="Avatar" />
                                <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                                <p className="font-medium">{order.customerName}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.address}</p>
                            </div>
                        </div>
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">
                         <div className="grid gap-0.5">
                            <p className="text-xs text-muted-foreground">{order.email}</p>
                            <p className="text-xs text-muted-foreground">{order.phone}</p>
                         </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className="text-xs"
                          variant={
                            order.status === "Shipped"
                              ? "secondary"
                              : order.status === "Processing"
                              ? "default"
                              : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Order actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Shipped
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
