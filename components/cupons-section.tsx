'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Percent, Copy, Check, TicketPercent } from 'lucide-react';

interface Cupom {
  id: string;
  codigo: string;
  descricao: string | null;
  percentual_desconto: number;
  ativo: boolean;
  data_inicio: string | null;
  data_fim: string | null;
  parceiros: { nome: string } | null;
}

function CupomCard({ cupom, onCopy }: { cupom: Cupom; onCopy: (codigo: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(cupom.codigo);
    setCopied(true);
    onCopy(cupom.codigo);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiresAt = cupom.data_fim
    ? new Date(cupom.data_fim).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className="relative group rounded-xl border border-border bg-card p-5 hover-lift flex flex-col gap-3">
      {/* Discount badge */}
      <div className="flex items-start justify-between gap-2">
        <Badge className="bg-primary/20 text-primary border-0 text-base px-3 py-1 font-bold">
          <Percent className="w-4 h-4 mr-1" />
          {cupom.percentual_desconto}% OFF
        </Badge>
        {cupom.parceiros && (
          <Badge variant="outline" className="text-xs border-primary/30 text-muted-foreground">
            {cupom.parceiros.nome}
          </Badge>
        )}
      </div>

      {/* Description */}
      {cupom.descricao && (
        <p className="text-sm text-muted-foreground">{cupom.descricao}</p>
      )}

      {/* Code + Copy */}
      <div className="flex items-center gap-2 mt-auto">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-dashed border-primary/40">
          <Tag className="w-4 h-4 text-primary shrink-0" />
          <span className="font-mono font-semibold text-foreground tracking-wider text-sm">{cupom.codigo}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="shrink-0 border-primary/50 hover:bg-primary/10"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expiresAt && (
        <p className="text-xs text-muted-foreground">Válido até {expiresAt}</p>
      )}
    </div>
  );
}

export function CuponsSection() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCodigo, setInputCodigo] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationMsg, setValidationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedMsg, setCopiedMsg] = useState('');

  useEffect(() => {
    const fetchCupons = async () => {
      try {
        const res = await fetch('/api/cupons', { cache: 'no-store' });
        const data = (await res.json()) as { sucesso: boolean; dados?: Cupom[] };
        if (data.sucesso && data.dados) {
          const now = new Date();
          const active = data.dados.filter((c) => {
            if (!c.ativo) return false;
            if (c.data_inicio && new Date(c.data_inicio) > now) return false;
            if (c.data_fim) {
              const fim = new Date(c.data_fim);
              fim.setHours(23, 59, 59, 999);
              if (now > fim) return false;
            }
            return true;
          });
          setCupons(active);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    void fetchCupons();
  }, []);

  const handleValidate = async () => {
    if (!inputCodigo.trim()) return;
    setValidating(true);
    setValidationMsg(null);
    try {
      const res = await fetch('/api/cupons/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: inputCodigo.trim() }),
      });
      const data = (await res.json()) as {
        sucesso: boolean;
        erro?: string;
        dados?: { percentual_desconto: number; codigo: string };
      };
      if (data.sucesso && data.dados) {
        setValidationMsg({
          type: 'success',
          text: `Cupom válido! Desconto de ${data.dados.percentual_desconto}% aplicado na página do produto.`,
        });
      } else {
        setValidationMsg({ type: 'error', text: data.erro ?? 'Cupom inválido.' });
      }
    } catch {
      setValidationMsg({ type: 'error', text: 'Erro de comunicação com o servidor.' });
    } finally {
      setValidating(false);
    }
  };

  const handleCopied = (codigo: string) => {
    setCopiedMsg(`Código ${codigo} copiado!`);
    setTimeout(() => setCopiedMsg(''), 2500);
  };

  if (!loading && cupons.length === 0) return null;

  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <TicketPercent className="w-4 h-4" />
            Promoções exclusivas
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cupons de <span className="text-gradient">Desconto</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Use os cupons abaixo na página do produto para garantir seu desconto exclusivo.
          </p>
        </div>

        {/* Coupon cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {cupons.map((cupom) => (
              <CupomCard key={cupom.id} cupom={cupom} onCopy={handleCopied} />
            ))}
          </div>
        )}

        {/* Toast for copied */}
        {copiedMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm shadow-lg animate-fade-in">
            {copiedMsg}
          </div>
        )}

        {/* Manual input section */}
        <div className="max-w-md mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-3">Ou verifique um código de cupom:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código do cupom..."
              value={inputCodigo}
              onChange={(e) => {
                setInputCodigo(e.target.value.toUpperCase());
                setValidationMsg(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleValidate(); }}
              className="bg-input border-border font-mono uppercase"
            />
            <Button
              onClick={() => void handleValidate()}
              disabled={validating || !inputCodigo.trim()}
              className="gradient-primary text-white shrink-0"
            >
              {validating ? '...' : 'Verificar'}
            </Button>
          </div>
          {validationMsg && (
            <p
              className={`mt-2 text-sm px-3 py-2 rounded-md ${
                validationMsg.type === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {validationMsg.text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
