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

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Notebook Dell Inspiron 15',
    description: 'Notebook Dell Inspiron 15 com processador Intel Core i5, ideal para trabalho e estudos. Excelente desempenho para tarefas do dia a dia.',
    specifications: 'Intel Core i5-1135G7, 8GB RAM DDR4, SSD 256GB, Tela 15.6" Full HD, Windows 11',
    category: 'Notebooks',
    brand: 'Dell',
    model: 'Inspiron 15 3520',
    price: 2899,
    costPrice: 2200,
    condition: 'recondicionado',
    status: 'disponivel',
    quantity: 3,
    isPublished: true,
    internalNotes: 'Verificado e testado. Bateria nova.',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'SSD Kingston NV2 500GB',
    description: 'SSD NVMe de alta velocidade para upgrade do seu notebook ou PC. Melhore drasticamente a velocidade do seu sistema.',
    specifications: 'NVMe PCIe 4.0, Leitura 3500MB/s, Gravação 2100MB/s, Interface M.2 2280',
    category: 'SSDs',
    brand: 'Kingston',
    model: 'NV2 500GB',
    price: 249,
    costPrice: 180,
    condition: 'novo',
    status: 'disponivel',
    quantity: 15,
    isPublished: true,
    internalNotes: 'Produto lacrado de fábrica.',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Memória RAM DDR4 8GB',
    description: 'Módulo de memória RAM DDR4 para notebooks. Compatível com a maioria dos notebooks modernos.',
    specifications: 'DDR4 3200MHz, SODIMM, Latência CL22, 1.2V',
    category: 'Memórias RAM',
    brand: 'Crucial',
    model: 'CT8G4SFRA32A',
    price: 159,
    costPrice: 110,
    condition: 'novo',
    status: 'disponivel',
    quantity: 20,
    isPublished: true,
    internalNotes: '',
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
  },
  {
    id: '4',
    name: 'Fonte Universal 90W',
    description: 'Fonte universal para notebooks com múltiplos conectores. Compatível com Dell, HP, Lenovo e outras marcas.',
    specifications: '90W, Entrada 100-240V, Saída 19V 4.74A, 8 conectores inclusos',
    category: 'Fontes',
    brand: 'Outro',
    model: 'Universal 90W',
    price: 129,
    costPrice: 75,
    condition: 'novo',
    status: 'disponivel',
    quantity: 8,
    isPublished: true,
    internalNotes: 'Alta qualidade, garantia estendida.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
  {
    id: '5',
    name: 'Tela LCD 15.6" Full HD',
    description: 'Tela de reposição para notebooks de 15.6 polegadas. Resolução Full HD com excelente qualidade de imagem.',
    specifications: '15.6" Full HD 1920x1080, IPS, 30 pinos, Slim',
    category: 'Telas',
    brand: 'LG',
    model: 'LP156WFC-SPD1',
    price: 459,
    costPrice: 320,
    condition: 'novo',
    status: 'disponivel',
    quantity: 5,
    isPublished: true,
    internalNotes: 'Compatível com diversos modelos.',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: '6',
    name: 'Teclado Dell Latitude E6430',
    description: 'Teclado de reposição original Dell para linha Latitude. Layout ABNT2 brasileiro.',
    specifications: 'ABNT2, Retroiluminado, Original Dell, Layout BR',
    category: 'Teclados',
    brand: 'Dell',
    model: 'Latitude E6430',
    price: 189,
    costPrice: 120,
    condition: 'usado',
    status: 'disponivel',
    quantity: 2,
    isPublished: true,
    internalNotes: 'Retirado de máquina em ótimo estado.',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '7',
    name: 'Notebook Lenovo ThinkPad T480',
    description: 'ThinkPad T480 empresarial com excelente durabilidade. Ideal para uso profissional intensivo.',
    specifications: 'Intel Core i7-8550U, 16GB RAM DDR4, SSD 512GB, Tela 14" Full HD, Windows 11 Pro',
    category: 'Notebooks',
    brand: 'Lenovo',
    model: 'ThinkPad T480',
    price: 3499,
    costPrice: 2800,
    condition: 'recondicionado',
    status: 'disponivel',
    quantity: 2,
    isPublished: true,
    internalNotes: 'Máquina corporativa, bem cuidada.',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    id: '8',
    name: 'Placa Mãe HP Pavilion 15',
    description: 'Placa mãe de reposição para HP Pavilion 15. Testada e funcionando perfeitamente.',
    specifications: 'Intel HM76, Suporte i3/i5/i7, DDR3L, Integrada',
    category: 'Placas',
    brand: 'HP',
    model: 'Pavilion 15-n Series',
    price: 399,
    costPrice: 250,
    condition: 'usado',
    status: 'disponivel',
    quantity: 1,
    isPublished: true,
    internalNotes: 'Funcionando 100%.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    createdAt: '2023-12-28',
    updatedAt: '2023-12-28',
  },
  {
    id: '9',
    name: 'Mouse Wireless Logitech M280',
    description: 'Mouse sem fio ergonômico com conexão wireless de 2.4GHz. Excelente precisão e conforto.',
    specifications: 'Wireless 2.4GHz, 1000 DPI, Pilha AA inclusa, Nano receptor USB',
    category: 'Acessórios',
    brand: 'Outro',
    model: 'M280',
    price: 79,
    costPrice: 50,
    condition: 'novo',
    status: 'disponivel',
    quantity: 12,
    isPublished: true,
    internalNotes: '',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
  },
  {
    id: '10',
    name: 'SSD Samsung 870 EVO 1TB',
    description: 'SSD SATA de alta performance para upgrade. Ideal para quem precisa de muito espaço.',
    specifications: 'SATA III, Leitura 560MB/s, Gravação 530MB/s, 2.5"',
    category: 'SSDs',
    brand: 'Samsung',
    model: '870 EVO 1TB',
    price: 549,
    costPrice: 400,
    condition: 'novo',
    status: 'reservado',
    quantity: 2,
    isPublished: true,
    internalNotes: 'Cliente reservou 1 unidade.',
    imageUrl: 'https://images.unsplash.com/photo-1597138804456-e7dca7f59d54?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11',
  },
  {
    id: '11',
    name: 'Notebook Acer Aspire 5',
    description: 'Notebook Acer para uso geral com ótimo custo-benefício.',
    specifications: 'AMD Ryzen 5 5500U, 8GB RAM, SSD 256GB, Tela 15.6" Full HD',
    category: 'Notebooks',
    brand: 'Acer',
    model: 'Aspire 5 A515-45',
    price: 2599,
    costPrice: 2100,
    condition: 'novo',
    status: 'disponivel',
    quantity: 1,
    isPublished: false,
    internalNotes: 'Aguardando fotos para publicar.',
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
  },
  {
    id: '12',
    name: 'Memória RAM DDR4 16GB Kit',
    description: 'Kit com 2 módulos de 8GB para máximo desempenho em dual channel.',
    specifications: 'DDR4 3200MHz, 2x8GB, SODIMM, CL22',
    category: 'Memórias RAM',
    brand: 'Kingston',
    model: 'ValueRAM KVR32S22S8/8',
    price: 299,
    costPrice: 220,
    condition: 'novo',
    status: 'sem_estoque',
    quantity: 0,
    isPublished: true,
    internalNotes: 'Encomendar mais unidades.',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-01-09',
    updatedAt: '2024-01-09',
  },
];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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
