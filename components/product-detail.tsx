'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useStore } from '@/lib/store-context';
import { formatPrice, getConditionLabel, getStatusInfo } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageCircle, ShieldCheck, Truck, Package, Tag } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const { getProductById } = useStore();
  const product = getProductById(id);

  if (!product || !product.isPublished) {
    notFound();
  }

  const statusInfo = getStatusInfo(product.status);
  const isAvailable = product.status === 'disponivel' && product.quantity > 0;

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no produto:\n\n*${product.name}*\nPreço: ${formatPrice(product.price)}\nCondição: ${getConditionLabel(product.condition)}\n\nGostaria de mais informações.`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Catálogo
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                  {product.category}
                </Badge>
                <Badge className={`${statusInfo.color} text-white border-0`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Brand and Condition */}
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="border-primary/50">
                  {product.brand}
                </Badge>
                <Badge variant="outline" className="border-accent/50">
                  {getConditionLabel(product.condition)}
                </Badge>
              </div>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-gradient">{formatPrice(product.price)}</p>
                {product.quantity > 0 && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {product.quantity} {product.quantity === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                  </p>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                {isAvailable ? (
                  <a
                    href={`https://wa.me/554884287544?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="lg" className="w-full gradient-primary text-white text-lg hover:opacity-90">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Comprar pelo WhatsApp
                    </Button>
                  </a>
                ) : (
                  <Button size="lg" disabled className="flex-1">
                    Produto Indisponível
                  </Button>
                )}
                <a
                  href={`https://wa.me/554884287544?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                    <Tag className="w-5 h-5 mr-2" />
                    Reservar
                  </Button>
                </a>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Garantia</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Pronta Entrega</span>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Especificações</h2>
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-muted-foreground whitespace-pre-line">{product.specifications}</p>
                </div>
              </div>

              {/* Model info */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Marca:</span>
                    <span className="text-foreground ml-2">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modelo:</span>
                    <span className="text-foreground ml-2">{product.model}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Condição:</span>
                    <span className="text-foreground ml-2">{getConditionLabel(product.condition)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="text-foreground ml-2">{product.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
