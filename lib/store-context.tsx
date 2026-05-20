'use client';

import { Product } from '@/lib/products';
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

type ApiResponse<T> = {
  sucesso: boolean;
  dados?: T;
  erro?: string;
};

type ApiProduct = {
  id: string;
  nome?: string;
  descricao?: string;
  especificacoes?: string;
  modelo?: string;
  preco?: number;
  preco_custo?: number;
  condicao?: Product['condition'];
  status?: Product['status'];
  quantidade?: number;
  publicado?: boolean;
  observacoes_internas?: string;
  imagem_url?: string;
  criado_em?: string;
  atualizado_em?: string;
  // Campos opcionais para manter compatibilidade com formatos antigos.
  name?: string;
  description?: string;
  specifications?: string;
  model?: string;
  price?: number;
  costPrice?: number;
  quantity?: number;
  isPublished?: boolean;
  internalNotes?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  brand?: string;
  categorias?: { nome?: string } | null;
  marcas?: { nome?: string } | null;
};

function mapApiProductToProduct(item: ApiProduct): Product {
  return {
    id: String(item.id),
    name: item.name ?? item.nome ?? 'Produto sem nome',
    description: item.description ?? item.descricao ?? '',
    specifications: item.specifications ?? item.especificacoes ?? '',
    category: item.category ?? item.categorias?.nome ?? 'Sem categoria',
    brand: item.brand ?? item.marcas?.nome ?? 'Sem marca',
    model: item.model ?? item.modelo ?? '',
    price: item.price ?? item.preco ?? 0,
    costPrice: item.costPrice ?? item.preco_custo ?? 0,
    condition: item.condicao ?? 'novo',
    status: item.status ?? 'disponivel',
    quantity: item.quantity ?? item.quantidade ?? 0,
    isPublished: item.isPublished ?? item.publicado ?? false,
    internalNotes: item.internalNotes ?? item.observacoes_internas ?? '',
    imageUrl: item.imageUrl ?? item.imagem_url ?? '',
    createdAt: item.createdAt ?? item.criado_em ?? new Date().toISOString().split('T')[0],
    updatedAt: item.updatedAt ?? item.atualizado_em ?? new Date().toISOString().split('T')[0],
  };
}

function mapProductToApiInput(product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) {
  return {
    name: product.name,
    description: product.description,
    specifications: product.specifications,
    category: product.category,
    brand: product.brand,
    model: product.model,
    price: product.price,
    costPrice: product.costPrice,
    condition: product.condition,
    status: product.status,
    quantity: product.quantity,
    isPublished: product.isPublished,
    internalNotes: product.internalNotes,
    imageUrl: product.imageUrl,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadProducts = useCallback(async () => {
    const response = await fetch('/api/produtos', { cache: 'no-store' });
    const result = (await response.json()) as ApiResponse<ApiProduct[]>;

    if (!response.ok || !result.sucesso || !result.dados) {
      throw new Error(result.erro ?? 'Falha ao carregar produtos');
    }

    setProducts(result.dados.map(mapApiProductToProduct));
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await loadProducts();
      } catch (error) {
        console.error('Erro ao buscar produtos da API:', error);
        setProducts([]);
      } finally {
        setIsLoaded(true);
      }
    };

    void run();
  }, [loadProducts]);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const run = async () => {
      try {
        const response = await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mapProductToApiInput(product)),
        });

        const result = (await response.json()) as ApiResponse<ApiProduct>;
        if (!response.ok || !result.sucesso || !result.dados) {
          throw new Error(result.erro ?? 'Falha ao criar produto');
        }

        await loadProducts();
      } catch (error) {
        console.error('Erro ao criar produto:', error);
      }
    };

    void run();
  }, [loadProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const run = async () => {
      try {
        const response = await fetch(`/api/produtos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mapProductToApiInput(updates)),
        });

        const result = (await response.json()) as ApiResponse<ApiProduct>;
        if (!response.ok || !result.sucesso) {
          throw new Error(result.erro ?? 'Falha ao atualizar produto');
        }

        await loadProducts();
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
      }
    };

    void run();
  }, [loadProducts]);

  const deleteProduct = useCallback((id: string) => {
    const run = async () => {
      try {
        const response = await fetch(`/api/produtos/${id}`, {
          method: 'DELETE',
        });

        const result = (await response.json()) as ApiResponse<null>;
        if (!response.ok || !result.sucesso) {
          throw new Error(result.erro ?? 'Falha ao remover produto');
        }

        await loadProducts();
      } catch (error) {
        console.error('Erro ao remover produto:', error);
      }
    };

    void run();
  }, [loadProducts]);

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
