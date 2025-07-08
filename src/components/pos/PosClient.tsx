'use client';

import { useEffect, useRef, useState } from 'react';
import { Category, Product, Promotion } from '@prisma/client';
import { processSale } from '@/lib/actions/pos.actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Minus, ScanLine } from 'lucide-react';
import CameraScanner from '@/components/scanner/CameraScanner'; 
import { useDebounce } from '@/hooks/useDebounce';
import { Badge } from '../ui/badge';

type ProductWithCategory = Product & { category: Category };

interface PosClientProps {
  products: ProductWithCategory[];
  promotions: Promotion[]; 
}

type CartItem = {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  quantity: number;
  stock: number;
  discountApplied: number;
};

export function PosClient({ products, promotions }: PosClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300); 
  const [filteredProducts, setFilteredProducts] = useState(products);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    searchInputRef.current?.focus();
    setFilteredProducts(products.filter((product) => product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())));
  }, [debouncedSearchTerm, products]);

  const applyPromotion = (product: ProductWithCategory): { finalPrice: number; discount: number } => {
    
    const applicablePromotions = promotions.filter((p) => p.categoryId === product.categoryId || p.categoryId === null);

    if (applicablePromotions.length === 0) {
      return { finalPrice: product.sellingPrice, discount: 0 };
    }

    
    const bestDiscount = Math.max(...applicablePromotions.map((p) => p.discountPercent));
    const finalPrice = product.sellingPrice * (1 - bestDiscount / 100);

    return { finalPrice, discount: bestDiscount };
  };
  const addToCart = (product: ProductWithCategory) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
          toast.warning(`Stok ${product.name} tidak mencukupi.`);
          return prevCart;
        }
      }

      
      const { finalPrice, discount } = applyPromotion(product);

      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          originalPrice: product.sellingPrice,
          price: finalPrice,
          quantity: 1,
          stock: product.stock,
          discountApplied: discount,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prevCart) => {
      const itemToUpdate = prevCart.find((item) => item.id === productId);
      if (!itemToUpdate) return prevCart;

      const newQuantity = itemToUpdate.quantity + amount;
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      }
      if (newQuantity > itemToUpdate.stock) {
        toast.warning(`Stok ${itemToUpdate.name} tidak mencukupi.`);
        return prevCart;
      }
      return prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item));
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    
    if (!paymentMethod) {
      toast.error('Metode pembayaran harus dipilih.');
      return;
    }

    
    const promise = processSale(cart, selectedCustomerId, totalAmount, paymentMethod);
    toast.promise(promise, {
      loading: 'Memproses transaksi...',
      success: (res) => {
        if (res.error) throw new Error(res.error);
        
        setCart([]);
        setSelectedCustomerId('');
        
        return res.success;
      },
      error: (err) => err.message,
    });
  };

  const handleScanSuccess = (scannedSku: string) => {
    setIsScannerOpen(false); 
    const product = products.find((p) => p.sku === scannedSku);
    if (product) {
      addToCart(product);
      toast.success(`Produk "${product.name}" ditambahkan ke keranjang.`);
    } else {
      toast.error(`Produk dengan SKU "${scannedSku}" tidak ditemukan.`);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      {isScannerOpen && <CameraScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScannerOpen(false)} />}
      {/* Kolom Kiri: Daftar Produk */}
      <div className="lg:col-span-2 bg-card rounded-lg shadow">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input ref={searchInputRef} placeholder="Cari atau pindai produk..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
            <ScanLine className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-[calc(100%-4.5rem)]">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => addToCart(product)}>
              <CardContent className="p-4 text-center">
                <p className="font-semibold text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">Stok: {product.stock}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Kolom Kanan: Keranjang Belanja */}
      <div className="bg-card rounded-lg shadow flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
          <CardTitle>Keranjang</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="mb-4">
            <Select onValueChange={setPaymentMethod} value={paymentMethod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Metode Pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Tunai (Cash)</SelectItem>
                <SelectItem value="QRIS">QRIS</SelectItem>
                <SelectItem value="DEBIT_CARD">Kartu Debit</SelectItem>
                <SelectItem value="CREDIT_CARD">Kartu Kredit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="w-28 text-center">Jml</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    {item.discountApplied > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.originalPrice)}</span>
                        <Badge variant="destructive">-{item.discountApplied}%</Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t mt-auto">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}</span>
          </div>
          <Button className="w-full" size="lg" onClick={handleCheckout} disabled={cart.length === 0}>
            Bayar
          </Button>
        </div>
      </div>
    </div>
  );
}
