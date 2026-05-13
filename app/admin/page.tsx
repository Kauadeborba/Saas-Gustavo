import { StoreProvider } from '@/lib/store-context';
import AdminPage from '@/components/admin-page';

export default function Page() {
  return (
    <StoreProvider>
      <AdminPage />
    </StoreProvider>
  );
}
