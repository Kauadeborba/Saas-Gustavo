'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useStore } from '@/lib/store-context';
import { Product, CATEGORIES, BRANDS, CONDITIONS, STATUSES, ProductCondition, ProductStatus, formatPrice, getConditionLabel, getStatusInfo } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Package, AlertTriangle, MinusCircle, PlusCircle, LogOut, Upload, X } from 'lucide-react';

// Funções helper para conversão de preços
const parsePriceInput = (value: string): number => {
  if (value === '') return 0;
  // Remove todos os pontos de separação de milhar, depois converte vírgula para ponto
  // Ex: "2.750,50" -> "2750,50" -> "2750.50"
  const normalized = value
    .replace(/\./g, '') // Remove todos os pontos
    .replace(',', '.'); // Converte vírgula para ponto
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

const formatPriceDisplay = (value: number): string => {
  if (value === 0) return '';
  return value.toString();
};

const getFirstImage = (imageUrl: string): string => {
  if (!imageUrl) return '/placeholder.png';
  try {
    if (imageUrl.startsWith('[')) {
      const images = JSON.parse(imageUrl) as string[];
      return images[0] || '/placeholder.png';
    }
  } catch (e) {}
  return imageUrl;
};

type AdminPageProps = {
  currentUser: {
    id: string;
    nome: string;
    email: string;
    tipo: 'admin' | 'operador';
    exp: number;
  };
};

type FormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

interface ProductFormProps {
  formData: FormData;
  imageUrls: string[];
  priceInputValue: string;
  costPriceInputValue: string;
  categoryOptions: string[];
  brandOptions: string[];
  isDraggingImage: boolean;
  handleFormChange: (field: keyof FormData, value: string | number | boolean) => void;
  handleAddImage: (base64: string) => void;
  handleRemoveImage: (index: number) => void;
  handlePriceInputChange: (value: string) => void;
  handleCostPriceInputChange: (value: string) => void;
  handlePriceInputBlur: () => void;
  handleCostPriceInputBlur: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  setIsDraggingImage: (isDragging: boolean) => void;
}

function ProductFormComponent({
  formData,
  imageUrls,
  priceInputValue,
  costPriceInputValue,
  categoryOptions,
  brandOptions,
  isDraggingImage,
  handleFormChange,
  handleAddImage,
  handleRemoveImage,
  handlePriceInputChange,
  handleCostPriceInputChange,
  handlePriceInputBlur,
  handleCostPriceInputBlur,
  handleImageChange,
  handleImageDrop,
  setIsDraggingImage,
}: ProductFormProps) {
  return (
    <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="Ex: Notebook Dell Inspiron 15"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => handleFormChange('model', e.target.value)}
            placeholder="Ex: Inspiron 3520"
            className="bg-input border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(v) => handleFormChange('category', v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Select value={formData.brand} onValueChange={(v) => handleFormChange('brand', v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brandOptions.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condição</Label>
          <Select value={formData.condition} onValueChange={(v) => handleFormChange('condition', v as ProductCondition)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda (R$) *</Label>
          <Input
            id="price"
            type="text"
            inputMode="decimal"
            value={priceInputValue}
            onChange={(e) => handlePriceInputChange(e.target.value)}
            onBlur={handlePriceInputBlur}
            placeholder="0,00"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
          <Input
            id="costPrice"
            type="text"
            inputMode="decimal"
            value={costPriceInputValue}
            onChange={(e) => handleCostPriceInputChange(e.target.value)}
            onBlur={handleCostPriceInputBlur}
            placeholder="0,00"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleFormChange('quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
            placeholder="0"
            className="bg-input border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(v) => handleFormChange('status', v as ProductStatus)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Fotos do Produto</Label>
          <div
            onDrop={handleImageDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingImage(true);
            }}
            onDragLeave={() => setIsDraggingImage(false)}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              isDraggingImage
                ? 'border-primary bg-primary/5'
                : imageUrls.length > 0
                ? 'border-primary/30 bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              multiple
            />
            
            {imageUrls.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
                        <img
                          src={url}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="bg-destructive text-white rounded-full p-2 hover:bg-destructive/90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{imageUrls.length} foto(s) adicionada(s)</p>
                  <p>Clique ou arraste para adicionar mais</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Arraste as fotos aqui</p>
                  <p className="text-muted-foreground">ou clique para selecionar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFormChange('description', e.target.value)}
          placeholder="Descreva o produto..."
          rows={3}
          className="bg-input border-border resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specifications">Especificações</Label>
        <Textarea
          id="specifications"
          value={formData.specifications}
          onChange={(e) => handleFormChange('specifications', e.target.value)}
          placeholder="Ex: Intel Core i5, 8GB RAM, SSD 256GB..."
          rows={3}
          className="bg-input border-border resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internalNotes">Observações Internas</Label>
        <Textarea
          id="internalNotes"
          value={formData.internalNotes}
          onChange={(e) => handleFormChange('internalNotes', e.target.value)}
          placeholder="Notas visíveis apenas no painel admin..."
          rows={2}
          className="bg-input border-border resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <Label htmlFor="isPublished" className="text-foreground font-medium">Publicar na Loja</Label>
          <p className="text-sm text-muted-foreground">
            {formData.isPublished ? 'Produto visível no catálogo público' : 'Produto visível apenas no painel admin'}
          </p>
        </div>
        <Switch
          id="isPublished"
          checked={formData.isPublished}
          onCheckedChange={(checked) => handleFormChange('isPublished', checked)}
        />
      </div>
    </div>
  );
}

const initialFormData: FormData = {
  name: '',
  description: '',
  specifications: '',
  category: 'Notebooks',
  brand: 'Dell',
  model: '',
  price: 0,
  costPrice: 0,
  condition: 'novo',
  status: 'disponivel',
  quantity: 1,
  isPublished: true,
  internalNotes: '',
  imageUrl: '',
};

export default function AdminPage({ currentUser }: AdminPageProps) {
  const router = useRouter();
  const { products, addProduct, updateProduct, deleteProduct, getStockSummary } = useStore();
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPublished, setFilterPublished] = useState<string>('todos');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState<string>('');
  const [costPriceInputValue, setCostPriceInputValue] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const summary = getStockSummary();

  const categoryOptions = useMemo(() => {
    const merged = new Set([...CATEGORIES, ...availableCategories, formData.category]);
    return Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [availableCategories, formData.category]);

  const brandOptions = useMemo(() => {
    const merged = new Set([...BRANDS, ...availableBrands, formData.brand]);
    return Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [availableBrands, formData.brand]);

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = search === '' || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.brand.toLowerCase().includes(search.toLowerCase()) ||
      product.model.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = filterCategory === 'todos' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'todos' || product.status === filterStatus;
    const matchesPublished = filterPublished === 'todos' || 
      (filterPublished === 'publicado' ? product.isPublished : !product.isPublished);

    return matchesSearch && matchesCategory && matchesStatus && matchesPublished;
  });

  const handleFormChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceInputChange = (value: string) => {
    setPriceInputValue(value);
  };

  const handleCostPriceInputChange = (value: string) => {
    setCostPriceInputValue(value);
  };

  const handlePriceInputBlur = () => {
    const parsed = parsePriceInput(priceInputValue);
    handleFormChange('price', parsed);
  };

  const handleCostPriceInputBlur = () => {
    const parsed = parsePriceInput(costPriceInputValue);
    handleFormChange('costPrice', parsed);
  };

  // Sincronizar valores dos inputs quando editar um produto existente
  useEffect(() => {
    if (editingProduct) {
      setPriceInputValue(editingProduct.price === 0 ? '' : editingProduct.price.toString());
      setCostPriceInputValue(editingProduct.costPrice === 0 ? '' : editingProduct.costPrice.toString());
    }
  }, [editingProduct?.id]);

  // Resetar imagens quando abre novo produto (sem editar)
  useEffect(() => {
    if (isAddDialogOpen && !editingProduct) {
      setImageUrls([]);
    }
  }, [isAddDialogOpen, editingProduct]);

  const handleAddImage = (base64: string) => {
    setImageUrls(prev => [...prev, base64]);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Armazenar múltiplas imagens como JSON string
    const dataToSubmit = {
      ...formData,
      imageUrl: imageUrls.length > 0 ? JSON.stringify(imageUrls) : ''
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, dataToSubmit);
      setEditingProduct(null);
    } else {
      addProduct(dataToSubmit);
    }
    setFormData(initialFormData);
    setImageUrls([]);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Tentar carregar múltiplas imagens do JSON
    let images: string[] = [];
    try {
      if (product.imageUrl && product.imageUrl.startsWith('[')) {
        images = JSON.parse(product.imageUrl);
      } else if (product.imageUrl) {
        images = [product.imageUrl];
      }
    } catch (e) {
      // Se não for JSON válido, tratar como string única
      images = product.imageUrl ? [product.imageUrl] : [];
    }
    
    setImageUrls(images);
    setFormData({
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
    });
    setIsAddDialogOpen(true);
  };

  const handleTogglePublish = (product: Product) => {
    updateProduct(product.id, { isPublished: !product.isPublished });
  };

  const handleQuickQuantityChange = (product: Product, delta: number) => {
    const newQuantity = Math.max(0, product.quantity + delta);
    const newStatus = newQuantity === 0 ? 'sem_estoque' : (product.status === 'sem_estoque' ? 'disponivel' : product.status);
    updateProduct(product.id, { quantity: newQuantity, status: newStatus as ProductStatus });
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
    setPriceInputValue('');
    setCostPriceInputValue('');
    setImageUrls([]);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          handleAddImage(base64String);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64String = event.target?.result as string;
            handleAddImage(base64String);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleClearImage = () => {
    handleFormChange('imageUrl', '');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Painel <span className="text-gradient">Administrativo</span>
              </h1>
              <p className="text-muted-foreground">Gerencie seus produtos e estoque</p>
              <p className="text-sm text-muted-foreground mt-2">
                Logado como <span className="font-medium text-foreground">{currentUser.nome}</span> ({currentUser.tipo})
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary text-white">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-card border-border" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do produto e adicione fotos para cadastrar ou editar
                    </DialogDescription>
                  </DialogHeader>
                  <ProductFormComponent
                    formData={formData}
                    imageUrls={imageUrls}
                    priceInputValue={priceInputValue}
                    costPriceInputValue={costPriceInputValue}
                    categoryOptions={categoryOptions}
                    brandOptions={brandOptions}
                    isDraggingImage={isDraggingImage}
                    handleFormChange={handleFormChange}
                    handleAddImage={handleAddImage}
                    handleRemoveImage={handleRemoveImage}
                    handlePriceInputChange={handlePriceInputChange}
                    handleCostPriceInputChange={handleCostPriceInputChange}
                    handlePriceInputBlur={handlePriceInputBlur}
                    handleCostPriceInputBlur={handleCostPriceInputBlur}
                    handleImageChange={handleImageChange}
                    handleImageDrop={handleImageDrop}
                    setIsDraggingImage={setIsDraggingImage}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} className="gradient-primary text-white" disabled={!formData.name || formData.price <= 0}>
                      {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-foreground">{summary.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Publicados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-green-500">{summary.published}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Internos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-yellow-500">{summary.internal}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Sem Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-red-500">{summary.outOfStock}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48 bg-input border-border">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Categorias</SelectItem>
                {categoryOptions.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40 bg-input border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPublished} onValueChange={setFilterPublished}>
              <SelectTrigger className="w-full md:w-40 bg-input border-border">
                <SelectValue placeholder="Visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="publicado">Publicados</SelectItem>
                <SelectItem value="interno">Internos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="mb-4 bg-muted">
              <TabsTrigger value="table">Tabela</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Produto</TableHead>
                        <TableHead className="text-muted-foreground">Categoria</TableHead>
                        <TableHead className="text-muted-foreground">Condição</TableHead>
                        <TableHead className="text-muted-foreground">Preço</TableHead>
                        <TableHead className="text-muted-foreground text-center">Qtd</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Publicado</TableHead>
                        <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map(product => {
                        const statusInfo = getStatusInfo(product.status);
                        return (
                          <TableRow key={product.id} className="border-border">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0"
                                  style={{ backgroundImage: `url(${getFirstImage(product.imageUrl)})` }}
                                />
                                <div>
                                  <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.brand} - {product.model}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-primary/50">{product.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-foreground">{getConditionLabel(product.condition)}</span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{formatPrice(product.price)}</p>
                                <p className="text-xs text-muted-foreground">Custo: {formatPrice(product.costPrice)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleQuickQuantityChange(product, -1)}
                                  disabled={product.quantity === 0}
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-medium text-foreground">{product.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleQuickQuantityChange(product, 1)}
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusInfo.color} text-white border-0`}>
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePublish(product)}
                                className={product.isPublished ? 'text-green-500 hover:text-green-600' : 'text-muted-foreground hover:text-foreground'}
                              >
                                {product.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(product)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-card border-border">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-foreground">Excluir Produto</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir &quot;{product.name}&quot;? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteProduct(product.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => {
                  const statusInfo = getStatusInfo(product.status);
                  return (
                    <Card key={product.id} className="bg-card border-border overflow-hidden">
                      <div
                        className="h-32 bg-cover bg-center"
                        style={{ backgroundImage: `url(${getFirstImage(product.imageUrl)})` }}
                      />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.brand} - {product.model}</p>
                          </div>
                          <Badge className={`${statusInfo.color} text-white border-0 shrink-0 ml-2`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="border-primary/50 text-xs">{product.category}</Badge>
                          <Badge variant="outline" className="text-xs">{getConditionLabel(product.condition)}</Badge>
                          {!product.isPublished && (
                            <Badge variant="secondary" className="text-xs">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Interno
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
                            <p className="text-xs text-muted-foreground">Custo: {formatPrice(product.costPrice)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{product.quantity} un.</p>
                            <p className="text-xs text-muted-foreground">em estoque</p>
                          </div>
                        </div>
                        {product.internalNotes && (
                          <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">
                            Nota: {product.internalNotes}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(product)}
                          >
                            {product.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Excluir Produto</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir &quot;{product.name}&quot;? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProduct(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
