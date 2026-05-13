import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center pt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl font-bold text-gradient">404</span>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Página não encontrada
            </h1>
            
            <p className="text-muted-foreground mb-8">
              O conteúdo que você está procurando não existe ou foi removido.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button className="gradient-primary text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
              <Link href="/catalogo">
                <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Ver Catálogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
