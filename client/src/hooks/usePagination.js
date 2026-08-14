import { useState, useMemo } from 'react';

export const usePagination = (dataArray, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(dataArray || []);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;

  const currentData = useMemo(() => {
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return data.slice(begin, end);
  }, [data, currentPage, itemsPerPage]);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  return { currentPage, totalPages, currentData, nextPage, prevPage, goToPage, setData, data };
};
