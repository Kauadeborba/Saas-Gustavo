'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, formatPrice, getConditionLabel, getStatusInfo } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, MessageCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const statusInfo = getStatusInfo(product.status);
  const isAvailable = product.status === 'disponivel' && product.quantity > 0;

  return (
    <Card className="group overflow-hidden hover-lift bg-card border-border">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm">
            {product.category}
          </Badge>
          <Badge 
            variant="outline" 
            className={`${statusInfo.color} text-white border-0`}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Condition badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-background/90 text-foreground backdrop-blur-sm border-primary/50">
            {getConditionLabel(product.condition)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-xs text-muted-foreground">{product.brand}</p>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-gradient">{formatPrice(product.price)}</p>
            {product.quantity > 0 && (
              <p className="text-xs text-muted-foreground">{product.quantity} em estoque</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/produto/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full group/btn border-primary/50 hover:bg-primary/10">
              <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              Ver Detalhes
            </Button>
          </Link>
          {isAvailable && (
            <a
              href={`https://wa.me/554884287544?text=Olá! Tenho interesse no produto: ${product.name} (${formatPrice(product.price)})`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gradient-primary text-white hover:opacity-90">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
