import { StoreProvider } from '@/lib/store-context';
import ProductPage from '@/components/product-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  return (
    <StoreProvider>
      <ProductPage params={params} />
    </StoreProvider>
  );
}
