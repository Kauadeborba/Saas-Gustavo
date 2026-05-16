import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AcessoNegado() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <Card className="border-border bg-card/95 backdrop-blur">
              <CardHeader className="space-y-3 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl text-foreground">Acesso Negado</CardTitle>
                <CardDescription>
                  Você não possui permissão para acessar o painel administrativo. Apenas administradores têm acesso.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Permissão Insuficiente</AlertTitle>
                  <AlertDescription>
                    Sua conta está vinculada a um tipo de usuário operador. Contate um administrador para solicitar acesso.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-2 pt-4">
                  <Link href="/catalogo">
                    <Button className="w-full">Voltar ao Catálogo</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Ir para Início
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}