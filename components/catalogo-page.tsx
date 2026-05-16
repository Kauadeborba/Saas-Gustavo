'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { useStore } from '@/lib/store-context';
import { CATEGORIES, BRANDS, CONDITIONS, STATUSES, ProductCondition, ProductStatus } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, Package } from 'lucide-react';
import { formatPrice } from '@/lib/products';

function CatalogoContent() {
  const { getPublishedProducts } = useStore();
  const searchParams = useSearchParams();
  
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('todos');
  const [brand, setBrand] = useState<string>('todos');
  const [condition, setCondition] = useState<ProductCondition | 'todos'>('todos');
  const [status, setStatus] = useState<ProductStatus | 'todos'>('disponivel');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Initialize category from URL
  useEffect(() => {
    const urlCategory = searchParams.get('categoria');
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriasResponse, marcasResponse] = await Promise.all([
          fetch('/api/categorias', { cache: 'no-store' }),
          fetch('/api/marcas', { cache: 'no-store' }),
        ]);

        const categoriasResult = (await categoriasResponse.json()) as { dados?: Array<{ nome?: string }> };
        const marcasResult = (await marcasResponse.json()) as { dados?: Array<{ nome?: string }> };

        if (categoriasResponse.ok) {
          setAvailableCategories((categoriasResult.dados ?? []).map((item) => item.nome ?? '').filter(Boolean));
        }

        if (marcasResponse.ok) {
          setAvailableBrands((marcasResult.dados ?? []).map((item) => item.nome ?? '').filter(Boolean));
        }
      } catch (error) {
        console.error('Erro ao carregar categorias/marcas:', error);
      }
    };

    void loadMetadata();
  }, []);

  const products = getPublishedProducts();

  const categoryOptions = useMemo(() => {
    const merged = new Set([...CATEGORIES, ...availableCategories, ...products.map((product) => product.category)]);
    return Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [availableCategories, products]);

  const brandOptions = useMemo(() => {
    const merged = new Set([...BRANDS, ...availableBrands, ...products.map((product) => product.brand)]);
    return Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [availableBrands, products]);

  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.price), 10000);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = search === '' || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = category === 'todos' || product.category === category;
      const matchesBrand = brand === 'todos' || product.brand === brand;
      const matchesCondition = condition === 'todos' || product.condition === condition;
      const matchesStatus = status === 'todos' || product.status === status;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesBrand && matchesCondition && matchesStatus && matchesPrice;
    });
  }, [products, search, category, brand, condition, status, priceRange]);

  const activeFiltersCount = [
    category !== 'todos',
    brand !== 'todos',
    condition !== 'todos',
    status !== 'disponivel',
    priceRange[0] > 0 || priceRange[1] < maxPrice,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setCategory('todos');
    setBrand('todos');
    setCondition('todos');
    setStatus('disponivel');
    setPriceRange([0, maxPrice]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label className="text-foreground">Categoria</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            {categoryOptions.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label className="text-foreground">Marca</Label>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Todas as marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as marcas</SelectItem>
            {brandOptions.map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-foreground">Condição</Label>
        <Select value={condition} onValueChange={(v) => setCondition(v as ProductCondition | 'todos')}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Todas as condições" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as condições</SelectItem>
            {CONDITIONS.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-foreground">Disponibilidade</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus | 'todos')}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
          <X className="w-4 h-4 mr-2" />
          Limpar Filtros ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Nosso <span className="text-gradient">Catálogo</span>
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 bg-card p-6 rounded-xl border border-border">
                <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">{activeFiltersCount}</Badge>
                  )}
                </h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Mobile Filter */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>
                
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden border-border relative">
                      <SlidersHorizontal className="w-5 h-5" />
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-card">
                    <SheetHeader>
                      <SheetTitle className="text-foreground">Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {category !== 'todos' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {category}
                      <button onClick={() => setCategory('todos')} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {brand !== 'todos' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {brand}
                      <button onClick={() => setBrand('todos')} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {condition !== 'todos' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {CONDITIONS.find(c => c.value === condition)?.label}
                      <button onClick={() => setCondition('todos')} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Package className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Tente ajustar os filtros ou realizar uma nova busca
                  </p>
                  <Button onClick={clearFilters} variant="outline" className="border-primary/50">
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Carregando...</div>
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  );
}
