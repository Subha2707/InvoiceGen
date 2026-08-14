import React from 'react';

const Table = ({ columns, data, renderRow }) => {
  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, index) => <th key={index}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">No data found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
