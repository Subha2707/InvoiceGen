import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const getPageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
};

const Pagination = ({ currentPage, totalPages, prevPage, nextPage, goToPage, onPageChange }) => {
  const handlePrev = () => {
    if (onPageChange) onPageChange(currentPage - 1);
    else prevPage();
  };
  const handleNext = () => {
    if (onPageChange) onPageChange(currentPage + 1);
    else nextPage();
  };
  const handleGo = (page) => {
    if (onPageChange) onPageChange(page);
    else if (goToPage) goToPage(page);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button onClick={handlePrev} disabled={currentPage === 1} className="page-btn">
        <FiChevronLeft /> Prev
      </button>
      {getPageNumbers(currentPage, totalPages).map(page => (
        <button
          key={page}
          onClick={() => handleGo(page)}
          className={`page-btn ${page === currentPage ? 'page-btn-active' : ''}`}
        >
          {page}
        </button>
      ))}
      <span className="page-info">Page {currentPage} of {totalPages}</span>
      <button onClick={handleNext} disabled={currentPage === totalPages} className="page-btn">
        Next <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;