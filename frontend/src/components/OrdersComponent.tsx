import React, {useEffect, useState} from 'react';
import {IOrder} from "../models/IOrder";
import {useNavigate, useSearchParams} from "react-router-dom";
import {jwtDecode, JwtPayload} from "jwt-decode";
import {IComment} from "../models/IComment";
import {ModalComponent} from "./ModalComponent";

const OrdersComponent: React.FC = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [comments, setComments] = useState<IComment[]>([])
    const [expandedOrderId, setExpandedOrderId]
        = useState<number | null>(null);
    const [editableOrder, setEditableOrder] = useState<IOrder>({
        id: 0,
        name: "",
        surname: "",
        email: "",
        phone: "",
        age: 0,
        course: "",
        courseFormat: "",
        courseType: "",
        status: "",
        sum: 0,
        alreadyPaid: 0,
        createdAt: "",
        manager: "",
        groupName: "",
        msg: "",
        utm: "",
        commentList: []
    });
    const [error, setError] = useState<string>('');
    const [totalPages, setTotalPages] = useState(1);
    const [currentUser, setCurrentUser] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const [searchParams, setSearchParams] = useSearchParams();

    const [modalInfoIsOpen, setModalInfoOpen] = useState(false);
    const [modalMode, setModalMode] = useState("enable_group");
    const [group, setGroup] = useState<string>('');
    const [groups, setGroups] = useState<string[]>([]);

    const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!isValidToken(token)) {
            console.error('Token is invalid or expired');
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
            return;
        }

        const fetchUser = () => {
            const decoded = jwtDecode<JwtPayload>(token!);
            setCurrentUser(decoded.sub || '');
        };

        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(
                    `/api/orders/groups`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch groups');
                const data = await response.json();
                setGroups(data)
            } catch (error) {
                console.error(error);
                setError('Failed to fetch groups. Please try again.');
            }
        };

        const fetchOrders = async () => {
            try {
                const response = await fetch(
                    `/api/orders?page=${currentPage}&size=25&sortField=${sortField}&sortOrder=${sortOrder}`,
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

        fetchUser();
        fetchGroups();
        fetchOrders();
    }, [currentPage, sortField, sortOrder]);

    const fetchCommentsForOrder = async (orderId: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/orders/${orderId}/comments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            if (!response.ok) throw new Error('Failed to fetch comments');

            const data = await response.json();
            setComments(data);

        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('Failed to fetch comments. Please try again.');
        }
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: (newPage).toString(), sortField, sortOrder });
    };

    const toggleExpandOrder = async (orderId: number) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            setComments([]);
        } else {
            setExpandedOrderId(orderId);
            await fetchCommentsForOrder(orderId);
        }
    };

    const handleSort = (field: string) => {
        const fieldMap: Record<string, string> = {
            course_format: 'courseFormat',
            course_type: 'courseType',
            already_paid: 'alreadyPaid',
            created_at: 'createdAt'
        };
        const sortFieldToSend = fieldMap[field] || field;
        const newSortOrder = sortField === sortFieldToSend && sortOrder === 'asc' ? 'desc' : 'asc';

        setSearchParams({ page: "1", sortField: sortFieldToSend, sortOrder: newSortOrder });
    };

    const handleCommentSubmit = async (event: React.FormEvent, orderId: number) => {
        event.preventDefault();

        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        if (order.manager && order.manager !== currentUser) {
            alert('You cannot comment on this order.');
            return;
        }

        if (!comment.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/orders/${orderId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text: comment,
                    manager: currentUser
                }),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                console.error('Failed to submit comment:', errorDetails);
                throw new Error(`Error: ${response.status}`);
            }

            const updatedOrder = await response.json();

            setOrders((prevOrders) =>
                prevOrders.map((o) => (o.id === orderId ? updatedOrder : o))
            );

            setComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Failed to submit comment. Please try again.');
        }
    };


    const openModal = async() => {
        const order = orders.find((o) => o.id === expandedOrderId);
        if (!order) return;

        if (order.manager && order.manager !== currentUser) {
            alert('You cannot edit this order.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/orders/${expandedOrderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            if (!response.ok) throw new Error('Failed to fetch order');

            const data = await response.json();
            setEditableOrder(data);

        } catch (error) {
            console.error('Error fetching order:', error);
            alert('Failed to fetch order. Please try again.');
        }
        setModalInfoOpen(true)
    }


    const updateOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        const nameRegex = /^[A-Za-zА-Яа-я\s]*$/;
        const emailRegex = /(^$|^[\w.-]+@[\w.-]+\.\w{2,}$)/;
        const phoneRegex = /(^$)|([0-9]{12})/;
        const numberRegex = /^\d*$/;
        const groupRegex = /^[A-Za-zА-Яа-я0-9\s\-_.,!@#$%^&*()]*$/;

        if (editableOrder.name && !nameRegex.test(editableOrder.name)) {
            alert("Name should contain only letters.");
            return;
        }
        if (editableOrder.surname && !nameRegex.test(editableOrder.surname)) {
            alert("Surname should contain only letters.");
            return;
        }
        if (editableOrder.email && !emailRegex.test(editableOrder.email)) {
            alert("Invalid email format.");
            return;
        }
        if (editableOrder.phone && !phoneRegex.test(editableOrder.phone)) {
            alert("Phone number must contain exactly 12 digits.");
            return;
        }
        if (editableOrder.age && !numberRegex.test(editableOrder.age.toString())) {
            alert("Age must be a number.");
            return;
        }
        if (editableOrder.sum && !numberRegex.test(editableOrder.sum.toString())) {
            alert("Sum must be a number.");
            return;
        }
        if (editableOrder.alreadyPaid && !numberRegex.test(editableOrder.alreadyPaid.toString())) {
            alert("Already Paid must be a number.");
            return;
        }
        if (editableOrder.groupName && !groupRegex.test(editableOrder.groupName)) {
            alert("Group name must contain only letters, numbers, spaces, and special characters.");
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/orders/${expandedOrderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editableOrder?.name,
                    surname: editableOrder?.surname,
                    email: editableOrder?.email,
                    phone: editableOrder?.phone,
                    age: editableOrder?.age,
                    course: editableOrder?.course,
                    courseFormat: editableOrder?.courseFormat,
                    courseType: editableOrder?.courseType,
                    status: editableOrder?.status,
                    sum: editableOrder?.sum,
                    alreadyPaid: editableOrder?.alreadyPaid,
                    manager: currentUser,
                    groupName: editableOrder?.groupName,
                }),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                console.error('Failed to update order:', errorDetails);
                throw new Error(`Error: ${response.status}`);
            }

            const updatedOrder = await response.json();

            setOrders((prevOrders) =>
                prevOrders.map((o) => (o.id === expandedOrderId ? updatedOrder : o))
            );

            setModalInfoOpen(false);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order. Please try again.');
        }
    }

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
                        'group',
                        'created_at',
                        'manager'
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
                    <>
                        <tr key={order.id} onClick={() => toggleExpandOrder(order.id)} className="order_row">
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
                            <td>{order.groupName}</td>
                            <td>{order.createdAt}</td>
                            <td>{order.manager}</td>
                        </tr>
                        {expandedOrderId === order.id && (
                            <tr>
                                <td colSpan={15}>
                                    <div className="order_additional">
                                        <div className="order_info">
                                            <a>Message: {order.msg}</a>
                                            <a>UTM: {order.utm}</a>
                                        </div>
                                        <div className="order_all_comments">
                                            <div className="order_comments_block">
                                                {comments.length > 0 ? (
                                                    comments.map((comment, index) => (
                                                        <div key={comment.id} className="order_comment_block">
                                                            <div className="com">
                                                                <div>{comment.text}</div>
                                                                <div>{currentUser} {comment.created_at}</div>
                                                            </div>
                                                            {index !== comments.length - 1 && <hr />}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div></div>
                                                )}
                                            </div>
                                            <div className="order_input_comment">
                                                <form id='comment' onSubmit={(e) =>
                                                    handleCommentSubmit(e, order.id)}>
                                                    <input type='text' id='input_comment' value={comment}
                                                           onChange={(e) =>
                                                               setComment(e.target.value)}
                                                           placeholder="Comment"/>
                                                    <button type="submit" className="login_button">SUBMIT</button>
                                                </form>
                                                <button className="edit_button" onClick={() =>
                                                    (openModal())}>EDIT</button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </>
                ))}
                </tbody>
            </table>
            <section>
                <ModalComponent isOpen={modalInfoIsOpen} onClose={() =>setModalInfoOpen(false)}>
                    <form id="modal_rows" onSubmit={updateOrder}>
                        <div className="first_row">
                            <div className="first_block">
                                <label>
                                    Group
                                </label>
                                <div>
                                    {modalMode === "enable_group" ? (
                                        <div className="block">
                                            <select value={editableOrder?.groupName || ""}
                                                    onChange={(e) =>
                                                setEditableOrder({...editableOrder, groupName: e.target.value})}>
                                                {groups.map((group) => (
                                                    <option key={group} value={group}
                                                            selected={group === editableOrder?.groupName}>
                                                        {group}
                                                    </option>
                                                ))}
                                            </select>
                                            <button className="first_button" type="button" onClick={() =>
                                                setModalMode("add_group")}>ADD GROUP</button>
                                        </div>
                                    ) : (
                                        <div className="block">
                                            <input
                                                type="text"
                                                id = "group"
                                                onChange={(e) =>
                                                    setGroup(e.target.value)}
                                                placeholder="Group"
                                            />
                                            <div className="group_button">
                                                <button type="button" onClick={() =>
                                                    groups.push(group)}>
                                                    ADD
                                                </button>
                                                <button type="button" onClick={async () => {
                                                    setModalMode("enable_group")
                                                }}>
                                                    SELECT
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="first_block">
                            <label>
                                    Status
                                </label>
                                <select id="second_select" value={editableOrder?.status || ""}
                                        onChange={(e) =>
                                            setEditableOrder({...editableOrder, status: e.target.value})}
                                >
                                    {['In Work', 'New', 'Aggre', 'Disaggre', 'Dubbing'].map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal_row">
                            <div className = "modal_block">
                            <label>
                                Name
                            </label>
                                <input type="text" placeholder="Name" value={editableOrder?.name || ""}
                                       onChange={(e) =>
                                           setEditableOrder({...editableOrder, name: e.target.value})}
                                />
                            </div>
                            <div className = "modal_block">
                            <label>
                                Sum
                            </label>
                                <input type="number" placeholder="Sum" value={editableOrder?.sum || ""}
                                       onChange={(e) =>
                                           setEditableOrder({...editableOrder, sum: +e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal_row">
                            <div className = "modal_block">
                            <label>
                                Surname
                            </label>
                                <input type="text" placeholder="Surname" value={editableOrder?.surname || ""}
                                       onChange={(e) =>
                                           setEditableOrder({...editableOrder, surname: e.target.value})}
                                />
                            </div>
                            <div className = "modal_block">
                            <label>
                                Already paid
                            </label>
                                <input type="number" placeholder="Already paid" value={editableOrder?.alreadyPaid || ""}
                                       onChange={(e) =>
                                           setEditableOrder({...editableOrder, alreadyPaid: +e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal_row">
                            <div className = "modal_block">
                            <label>
                                Email
                            </label>
                                <input type="email" placeholder="Email" value={editableOrder?.email || ""}
                                       onChange={(e) =>
                                           setEditableOrder({...editableOrder, email: e.target.value})}
                                />
                            </div>
                            <div className = "modal_block">
                            <label>
                                Course
                            </label>
                                <select value={editableOrder?.course || ""}
                                        onChange={(e) =>
                                            setEditableOrder({...editableOrder, course: e.target.value})}
                                >
                                    {['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'].map((course) => (
                                        <option key={course} value={course}
                                                selected={course === editableOrder?.course}>
                                        {course}
                                        </option>))}
                                </select>
                            </div>
                        </div>
                        <div className="modal_row">
                            <div className = "modal_block">
                            <label>
                                Phone
                            </label>
                                <input type="tel" placeholder="Phone" value={editableOrder?.phone || ""}
                                       onChange={(e) =>
                                           setEditableOrder({...editableOrder, phone: e.target.value})}
                                />
                            </div>
                            <div className = "modal_block">
                            <label>
                                Course Format
                            </label>
                                <select value={editableOrder?.courseFormat || ""}
                                        onChange={(e) =>
                                            setEditableOrder({...editableOrder, courseFormat: e.target.value})}
                                >
                                    {['static', 'online'].map((format) => (
                                        <option key={format} value={format}
                                                selected={format === editableOrder?.courseFormat}>
                                            {format}
                                        </option>))}
                                </select>
                            </div>
                        </div>
                        <div className="modal_row">
                            <div className = "modal_block">
                            <label>
                                Age
                            </label>
                                <input type="number" placeholder="Age" value={editableOrder?.age || ""}
                                       onChange={(e) =>
                                           setEditableOrder({...editableOrder, age: +e.target.value})}
                                />
                            </div>
                            <div className = "modal_block">
                            <label>
                                Course Type
                            </label>
                                <select value={editableOrder?.courseType || ""}
                                        onChange={(e) =>
                                            setEditableOrder({...editableOrder, courseType: e.target.value})}
                                >
                                    {['pro', 'minimal', 'premium', 'incubator', 'vip'].map((type) => (
                                        <option key={type} value={type}
                                                selected={type === editableOrder?.courseType}>
                                            {type}
                                        </option>))}
                                </select>
                            </div>
                        </div>
                        <div className="modal_button">
                            <button type="button" onClick={() => setModalInfoOpen(false)}>CLOSE</button>
                            <button type='submit' form='modal_rows'>SUBMIT</button>
                        </div>
                    </form>
                </ModalComponent>
            </section>
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
                            className={page === currentPage ? 'active' : ''}
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