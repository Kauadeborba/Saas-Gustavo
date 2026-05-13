import { StoreProvider } from '@/lib/store-context';
import CatalogoPage from '@/components/catalogo-page';

export default function Page() {
  return (
    <StoreProvider>
      <CatalogoPage />
    </StoreProvider>
  );
}
