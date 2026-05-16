export type ProductCondition = 'novo' | 'usado' | 'recondicionado';
export type ProductStatus = 'disponivel' | 'reservado' | 'vendido' | 'sem_estoque';

export interface Product {
  id: string;
  name: string;
  description: string;
  specifications: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  costPrice: number;
  condition: ProductCondition;
  status: ProductStatus;
  quantity: number;
  isPublished: boolean;
  internalNotes: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES = [
  'Notebooks',
  'SSDs',
  'Memórias RAM',
  'Fontes',
  'Telas',
  'Teclados',
  'Placas',
  'Acessórios',
] as const;

export const BRANDS = [
  'Dell',
  'HP',
  'Lenovo',
  'Asus',
  'Acer',
  'Samsung',
  'Kingston',
  'Crucial',
  'WD',
  'Seagate',
  'Corsair',
  'HyperX',
  'Apple',
  'Microsoft',
  'LG',
  'Outro',
] as const;

export const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: 'novo', label: 'Novo' },
  { value: 'usado', label: 'Usado' },
  { value: 'recondicionado', label: 'Recondicionado' },
];

export const STATUSES: { value: ProductStatus; label: string; color: string }[] = [
  { value: 'disponivel', label: 'Disponível', color: 'bg-green-500' },
  { value: 'reservado', label: 'Reservado', color: 'bg-yellow-500' },
  { value: 'vendido', label: 'Vendido', color: 'bg-blue-500' },
  { value: 'sem_estoque', label: 'Sem Estoque', color: 'bg-red-500' },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function getConditionLabel(condition: ProductCondition): string {
  return CONDITIONS.find(c => c.value === condition)?.label || condition;
}

export function getStatusInfo(status: ProductStatus) {
  return STATUSES.find(s => s.value === status) || STATUSES[0];
}
