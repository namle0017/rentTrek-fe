import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

export default function ProductListPage() {
  // Trang hiện tại + từ khoá lưu trên URL → F5 / share link không mất trạng thái
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Number(searchParams.get('pageNumber')) || DEFAULT_PAGE_NUMBER;
  const search = searchParams.get('search') ?? '';

  const [keyword, setKeyword] = useState(search);
  const debouncedKeyword = useDebounce(keyword.trim());

  useEffect(() => {
    if (debouncedKeyword === search) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedKeyword) next.set('search', debouncedKeyword);
        else next.delete('search');
        next.delete('pageNumber'); // đổi từ khoá → về trang 1
        return next;
      },
      { replace: true },
    );
  }, [debouncedKeyword, search, setSearchParams]);

  const {
    data: pagedProducts,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    search,
  });

  const handlePageChange = (nextPageNumber) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('pageNumber', String(nextPageNumber));
      return next;
    });
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
    if (pagedProducts.items.length === 0) return <EmptyState message="Không tìm thấy sản phẩm nào" />;

    return (
      <>
        <div className="grid">
          {pagedProducts.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Pagination
          pageNumber={pagedProducts.pageNumber}
          totalPages={pagedProducts.totalPages}
          hasPrevious={pagedProducts.hasPrevious}
          hasNext={pagedProducts.hasNext}
          onPageChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Sản phẩm</h1>
        <input
          type="search"
          className="input page-search"
          placeholder="Tìm sản phẩm..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>
      {renderContent()}
    </section>
  );
}
