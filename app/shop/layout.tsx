import { CartProvider } from "@/components/shop/CartProvider";

// The cart lives only under /shop, so the rest of the site keeps its current
// provider tree untouched.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
