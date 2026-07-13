import ProductDetailView from '@/components/ProductDetailView';

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailView productId={decodeURIComponent(params.id)} />;
}
