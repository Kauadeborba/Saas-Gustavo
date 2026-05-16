'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, LoaderCircle } from 'lucide-react';

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const result = (await response.json()) as {
        sucesso: boolean;
        erro?: string;
      };

      if (!response.ok || !result.sucesso) {
        throw new Error(result.erro ?? 'Não foi possível entrar');
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro inesperado ao fazer login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <Card className="border-border bg-card/95 backdrop-blur">
              <CardHeader className="space-y-3 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl text-foreground">Acesso Administrativo</CardTitle>
                <CardDescription>
                  Entre com seu usuário cadastrado para acessar o painel da TechNote.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@empresa.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      placeholder="Sua senha"
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  {erro ? (
                    <Alert variant="destructive">
                      <AlertTitle>Falha no login</AlertTitle>
                      <AlertDescription>{erro}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Button type="submit" className="w-full gradient-primary text-white" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar no painel'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
