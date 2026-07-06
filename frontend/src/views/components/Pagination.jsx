import React from "react";

const Pagination = ({ current, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0.5rem 0" }}>
      <div className="pagination-info" style={{ color: "#64748b", fontSize: "0.85rem" }}>
        Showing <strong>{(current - 1) * limit + 1}</strong> to <strong>{Math.min(current * limit, total)}</strong> of <strong>{total}</strong> entries
      </div>
      <div className="pagination-btns" style={{ display: "flex", gap: "0.5rem" }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: "4px 12px", fontSize: "0.8rem", cursor: current > 1 ? "pointer" : "not-allowed", opacity: current > 1 ? 1 : 0.5 }}
          onClick={() => current > 1 && onPageChange(current - 1)}
          disabled={current <= 1}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
             // Basic pagination range logic
             let pageNum;
             if (totalPages <= 5) pageNum = i + 1;
             else if (current <= 3) pageNum = i + 1;
             else if (current >= totalPages - 2) pageNum = totalPages - 4 + i;
             else pageNum = current - 2 + i;

             return (
               <button
                 key={pageNum}
                 className={`btn ${current === pageNum ? "btn-primary" : "btn-secondary"}`}
                 style={{ padding: "4px 10px", fontSize: "0.8rem", minWidth: "32px" }}
                 onClick={() => onPageChange(pageNum)}
               >
                 {pageNum}
               </button>
             );
          })}
        </div>
        <button 
          className="btn btn-secondary" 
          style={{ padding: "4px 12px", fontSize: "0.8rem", cursor: current < totalPages ? "pointer" : "not-allowed", opacity: current < totalPages ? 1 : 0.5 }}
          onClick={() => current < totalPages && onPageChange(current + 1)}
          disabled={current >= totalPages}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
