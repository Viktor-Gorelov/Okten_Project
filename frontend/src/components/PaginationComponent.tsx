import React from 'react';
import "../App.css"

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const generatePagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= halfVisible) {
            for (let i = 1; i < maxVisiblePages - 1; i++) {
                pages.push(i);
            }
            pages.push("...", totalPages);
        } else if (currentPage >= totalPages - halfVisible) {
            pages.push(1, "...");
            for (let i = totalPages - (maxVisiblePages - 2); i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1, "...");
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push("...", totalPages);
        }
        return pages;
    };

    return (
        <div className="pagination">
            {currentPage > 1 && (
                <button className="arrow" onClick={() => onPageChange(currentPage - 1)}>
                    &#60;
                </button>
            )}
            {generatePagination().map((page, index) =>
                typeof page === "number" ? (
                    <button
                        key={index}
                        className={page === currentPage ? "active" : ""}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index}>...</span>
                )
            )}
            {currentPage < totalPages && (
                <button className="arrow" onClick={() => onPageChange(currentPage + 1)}>
                    &#62;
                </button>
            )}
        </div>
    );
};

export default PaginationComponent;