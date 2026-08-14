import React, { useState, useEffect } from 'react';
import { GST_OPTIONS, calculateLineItemGST, formatCurrency } from '../../utils/invoiceCalc';
import { FiChevronLeft, FiChevronRight, FiTrash2, FiPlus } from 'react-icons/fi';

const ITEMS_PER_PAGE = 5;

const ItemEditor = ({ items, setItems, sellerStateCode, clientStateCode, currency = 'INR' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(ITEMS_PER_PAGE);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, [field]: value };
      if (field === 'gstEnabled' && !value) next.gstPercentage = 0;
      return next;
    });
    setItems(updated);
  };

  const addItem = () => {
    const newItems = [...items, { name: '', description: '', quantity: 1, unitPrice: 0, gstEnabled: false, gstPercentage: 0 }];
    setItems(newItems);
    setCurrentPage(Math.ceil(newItems.length / perPage));
  };

  const deleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    if (currentPage > Math.ceil(newItems.length / perPage)) {
      setCurrentPage(Math.max(1, Math.ceil(newItems.length / perPage)));
    }
  };

  const startIndex = (currentPage - 1) * perPage;
  const pageItems = items.slice(startIndex, startIndex + perPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="item-editor">
      <div className="items-table-header">
        <h3>Invoice Items</h3>
        <span className="items-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-responsive">
        <table className="custom-table items-table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>Item</th>
              <th>Description</th>
              <th style={{ width: 70 }}>Qty</th>
              <th style={{ width: 110 }}>Unit Price</th>
              <th style={{ width: 70 }}>GST</th>
              <th style={{ width: 90 }}>GST %</th>
              <th style={{ width: 110 }}>Total</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">No items yet. Click "+ Add Item" to begin.</td>
              </tr>
            )}
            {pageItems.map((item, idx) => {
              const realIndex = startIndex + idx;
              const line = calculateLineItemGST(item, sellerStateCode, clientStateCode);
              return (
                <tr key={realIndex}>
                  <td data-label="Item">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={e => updateItem(realIndex, 'name', e.target.value)}
                    />
                  </td>
                  <td data-label="Description">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateItem(realIndex, 'description', e.target.value)}
                    />
                  </td>
                  <td data-label="Qty">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={e => updateItem(realIndex, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td data-label="Unit Price">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => updateItem(realIndex, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td data-label="GST" className="text-center">
                    <input
                      type="checkbox"
                      checked={item.gstEnabled}
                      onChange={e => updateItem(realIndex, 'gstEnabled', e.target.checked)}
                    />
                  </td>
                  <td data-label="GST %">
                    <select
                      value={item.gstPercentage}
                      disabled={!item.gstEnabled}
                      onChange={e => updateItem(realIndex, 'gstPercentage', parseFloat(e.target.value))}
                    >
                      {GST_OPTIONS.map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Total" className="text-right">{formatCurrency(line.totalPrice, currency)}</td>
                  <td data-label="Action" className="text-center">
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      title="Delete item"
                      onClick={() => deleteItem(realIndex)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="items-pagination-bar">
        <button type="button" className="btn btn-sm btn-outline" onClick={addItem}>
          <FiPlus /> Add Item
        </button>

        {totalPages > 1 && (
          <div className="items-pagination">
            <span className="items-pagination-info">
              Showing {items.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + perPage, items.length)} of {items.length}
            </span>
            <div className="pagination-btns">
              <button
                type="button"
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <FiChevronLeft />
              </button>
              {renderPageNumbers().map(page => (
                <button
                  key={page}
                  type="button"
                  className={`page-btn ${page === currentPage ? 'page-btn-active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                <FiChevronRight />
              </button>
            </div>
            <select
              className="per-page-select"
              value={perPage}
              onChange={e => { setPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemEditor;
