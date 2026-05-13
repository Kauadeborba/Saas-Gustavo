'use client';

import { Product, initialProducts, generateId } from '@/lib/products';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface StoreContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getPublishedProducts: () => Product[];
  getStockSummary: () => {
    total: number;
    published: number;
    internal: number;
    outOfStock: number;
    totalValue: number;
    totalCost: number;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'technote_products';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch {
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isLoaded]);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find(p => p.id === id),
    [products]
  );

  const getPublishedProducts = useCallback(
    () => products.filter(p => p.isPublished),
    [products]
  );

  const getStockSummary = useCallback(() => {
    const total = products.length;
    const published = products.filter(p => p.isPublished).length;
    const internal = products.filter(p => !p.isPublished).length;
    const outOfStock = products.filter(p => p.quantity === 0 || p.status === 'sem_estoque').length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.quantity, 0);
    return { total, published, internal, outOfStock, totalValue, totalCost };
  }, [products]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getPublishedProducts,
        getStockSummary,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
