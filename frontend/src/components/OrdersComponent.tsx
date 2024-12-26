import React, {useEffect, useState} from 'react';
import {IOrder} from "../models/IOrder";
import {useNavigate, useSearchParams} from "react-router-dom";
import {jwtDecode, JwtPayload} from "jwt-decode";

const OrdersComponent: React.FC = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [error, setError] = useState<string>('');
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const navigate = useNavigate();


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!isValidToken(token)) {
                    console.error('Token is invalid or expired');
                    setError('Your session has expired. Please log in again.');
                    navigate('/login');
                    return;
                }

                const response = await fetch(
                    `/api/orders?page=${currentPage - 1}&size=25&sortField=${sortField}&sortOrder=${sortOrder}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch orders');
                const data = await response.json();
                setOrders(data.content);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error(error);
                setError('Failed to fetch orders. Please try again.');
            }
        };

        fetchOrders();
    }, [currentPage, sortField, sortOrder]);

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: (newPage).toString(), sortField, sortOrder });
    };

    const handleSort = (field: string) => {
        const fieldMap: Record<string, string> = {
            course_format: 'courseFormat',
            course_type: 'courseType',
            already_paid: 'alreadyPaid',
            created_at: 'createdAt',
        };
        const sortFieldToSend = fieldMap[field] || field;
        const newSortOrder = sortField === sortFieldToSend && sortOrder === 'asc' ? 'desc' : 'asc';

        setSearchParams({ page: "1", sortField: sortFieldToSend, sortOrder: newSortOrder });
    };

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (!decoded.exp) return false;
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            console.error('Invalid token:', error);
            return true;
        }
    };

    const isValidToken = (token: string | null): boolean => {
        if (!token) return false;
        return token.split('.').length === 3 && !isTokenExpired(token);
    };

    const generatePagination = () => {
        const pages = [];
        const maxVisiblePages = 8;
        const halfVisible = Math.floor(maxVisiblePages / 2);

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i < totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= halfVisible) {
            for (let i = 1; i < maxVisiblePages - 1; i++) {
                pages.push(i);
            }
            pages.push('...', totalPages);
        } else if (currentPage >= totalPages - halfVisible - 1) {
            pages.push(1, '...');
            for (let i = totalPages - maxVisiblePages + 1; i < totalPages + 1; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1, '...');
            for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
                pages.push(i);
            }
            pages.push('...', totalPages);
        }
        return pages;
    };

    return (
        <div>
            <table>
                <thead>
                <tr>
                    {[
                    'id',
                    'name',
                    'surname',
                    'email',
                    'phone',
                    'age',
                    'course',
                    'course_format',
                    'course_type',
                    'status',
                    'sum',
                    'alreadyPaid',
                    'created_at',
                    ].map((field) => (
                    <th
                        key={field}
                        scope="col"
                        onClick={() => handleSort(field)}
                        style={{ cursor: 'pointer' }}
                    >
                        {field}{' '}
                        {sortField === field && (sortOrder === 'asc')}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.name}</td>
                        <td>{order.surname}</td>
                        <td>{order.email}</td>
                        <td>{order.phone}</td>
                        <td>{order.age}</td>
                        <td>{order.course}</td>
                        <td>{order.courseFormat}</td>
                        <td>{order.courseType}</td>
                        <td>{order.status}</td>
                        <td>{order.sum}</td>
                        <td>{order.alreadyPaid}</td>
                        <td>{order.createdAt}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="pagination">
                {currentPage > 1 && (
                    <button className='arrow' onClick={() => handlePageChange(currentPage - 1)}>
                        &#60;
                    </button>
                )}
                {generatePagination().map((page, index) =>
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            className={page === currentPage? 'active' : ''}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index}>...</span>
                    )
                )}
                {currentPage + 1 < totalPages + 1 && (
                    <button className='arrow' onClick={() => handlePageChange(currentPage + 1)}>
                        &#62;
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrdersComponent;