import React, {useEffect, useState} from 'react';
import {IOrder} from "../models/IOrder";
import {useNavigate, useSearchParams} from "react-router-dom";
import {jwtDecode, JwtPayload} from "jwt-decode";
import {IComment} from "../models/IComment";
import {ModalComponent} from "./ModalComponent";
import * as XLSX from "xlsx";
import PaginationComponent from "./PaginationComponent";

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

    const [filters, setFilters] = useState({
        name: searchParams.get("name") || "",
        surname: searchParams.get("surname") || "",
        email: searchParams.get("email") || "",
        phone: searchParams.get("phone") || "",
        age: searchParams.get("age") || "",
        course: searchParams.get("course") || "all",
        courseFormat: searchParams.get("courseFormat") || "all",
        courseType: searchParams.get("courseType") || "all",
        status: searchParams.get("status") || "all",
        group: searchParams.get("group") || "all",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        onlyMy: searchParams.get("onlyMy") || "false",
    });
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    let currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
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

        const fetchUser = async () => {
            try {
                const decoded = jwtDecode<JwtPayload &{ user_id: string}>(token!);
                const response = await fetch(
                    `/api/managers/${decoded.user_id}/name`,
                        {
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                );
                const data = await response.text();
                setCurrentUser(data)
            }
            catch (error){
                console.error(error);
                setError('Failed to fetch user. Please try again.');
            }
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
                const params = new URLSearchParams();

                params.append("page", currentPage.toString());
                params.append("size", "25");
                params.append("sortField", sortField);
                params.append("sortOrder", sortOrder);

                const optionalParams = ["name", "surname", "email", "phone", "age", "course",
                    "courseFormat", "courseType", "status", "group", "startDate", "endDate", "onlyMy"];
                optionalParams.forEach(param => {
                    const value = searchParams.get(param);
                    if (value && value !== "all") params.append(param, value);
                });

                const response = await fetch(`/api/orders?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

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
    }, [currentPage, sortField, sortOrder, searchParams]);

    const resetFilters = () => {
        setFilters({
            name: "",
            surname: "",
            email: "",
            phone: "",
            age: "",
            course: "all",
            courseFormat: "all",
            courseType: "all",
            status: "all",
            group: "all",
            startDate: "",
            endDate: "",
            onlyMy: "false",
        });
        setSearchParams({});
    };

    const exportAllOrdersToExcel = async () => {
        try {
            const params = new URLSearchParams(searchParams);
            if (!params.toString()) {
                params.set("sortField", "createdAt");
                params.set("sortOrder", "desc");
                params.set("page","1");
            }
            console.log(params)

            const firstResponse = await fetch(`/api/orders?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!firstResponse.ok) throw new Error("Failed to fetch orders");
            const firstData = await firstResponse.json();
            const totalPages = firstData.totalPages;

            const pageRequests = [];
            params.delete("page");
            for (let page = 1; page <= totalPages; page++) {
                pageRequests.push(
                    fetch(`/api/orders?page=${page}&${params.toString()}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }).then((res) => res.json())
                );
            }

            const allPages = await Promise.all(pageRequests);
            const allOrders = allPages.flatMap((page) => page.content);

            const exportData = allOrders.map((order) => ({
                ID: order.id,
                Name: order.name,
                Surname: order.surname,
                Email: order.email,
                Phone: order.phone,
                Age: order.age,
                Course: order.course,
                "Course Format": order.courseFormat,
                "Course Type": order.courseType,
                Status: order.status,
                Sum: order.sum,
                "Already Paid": order.alreadyPaid,
                Group: order.groupName,
                "Created At": order.createdAt,
                Manager: order.manager,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
            XLSX.writeFile(workbook, "all_filtered_orders.xlsx");
        } catch (error) {
            console.error("Error exporting orders:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const dateRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/;

        setFilters((prev) => ({ ...prev, [name]: value }));

        if (typingTimeout) clearTimeout(typingTimeout);

        const isDateField = name === "startDate" || name === "endDate";

        if (isDateField) {
            const updatedFilters = { ...filters, [name]: value };

            if (!updatedFilters.startDate || !updatedFilters.endDate) {
                return;
            }

            const timeout = setTimeout(() => {
                if (!dateRegex.test(updatedFilters.startDate) || !dateRegex.test(updatedFilters.endDate)) {
                    alert("Date must be in format: 'MMMM d, yyyy' (e.g., 'January 5, 2024').");
                    return;
                }

                setSearchParams((prevParams) => {
                    const newParams = new URLSearchParams(prevParams);
                    newParams.set("startDate", updatedFilters.startDate);
                    newParams.set("endDate", updatedFilters.endDate);
                    newParams.set("page", "1");
                    currentPage = 1;
                    newParams.set("sortField", sortField);
                    newParams.set("sortOrder", sortOrder);
                    return newParams;
                });
            }, 1000);

            setTypingTimeout(timeout);
            return;
        }

        const timeout = setTimeout(() => {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                if (value) {
                    newParams.set(name, value);
                } else {
                    newParams.delete(name);
                }
                newParams.set("page", "1");
                newParams.set("sortField", sortField);
                newParams.set("sortOrder", sortOrder);
                return newParams;
            });
        }, 500);

        setTypingTimeout(timeout);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;

        setFilters((prev) => ({ ...prev, onlyMy: `${isChecked}` }));
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);

            if (isChecked) {
                newParams.set("onlyMy", "true");
            } else {
                newParams.delete("onlyMy");
            }

            newParams.set("page", "1");
            return newParams;
        });
    }

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
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("page", newPage.toString());
            return newParams;
        });
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
            created_at: 'createdAt',
            group: 'groupName'
        };
        const sortFieldToSend = fieldMap[field] || field;
        const newSortOrder = sortField === sortFieldToSend && sortOrder === 'asc' ? 'desc' : 'asc';

        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("sortField", sortFieldToSend);
            newParams.set("sortOrder", newSortOrder);
            newParams.set("page", "1");
            return newParams;
        });
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

    return (
        <div>
            <div className="filter_all">
                <div className="filter_blocks">
                    <div className="filter_first_row">
                        <div className="filter_block">
                            <input type="text" name="name" placeholder="Name" value={filters.name || ''}
                                   onChange={handleChange}/>
                        </div>
                        <div className="filter_block">
                            <input type="text" name="surname" placeholder="Surname" value={filters.surname || ''}
                                   onChange={handleChange}/>
                        </div>
                        <div className="filter_block">
                            <input type="email" name="email" placeholder="Email" value={filters.email || ''}
                                   onChange={handleChange}/>
                        </div>
                        <div className="filter_block">
                            <input type="tel" name="phone" placeholder="Phone" value={filters.phone || ''}
                                   onChange={handleChange}/>
                        </div>
                        <div className="filter_block">
                            <input type="number" name="age" placeholder="Age" value={filters.age || ''}
                                   onChange={handleChange}/>
                        </div>
                        <div className="filter_block">
                            <select name="course" value={filters.course || 'all'} onChange={handleChange}>
                                <option value="all">All courses</option>
                                {['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'].map((course) => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter_second_row">
                        <div className="filter_block">
                            <select name="courseFormat" value={filters.courseFormat || 'all'} onChange={handleChange}>
                                <option value="all">All formats</option>
                                {['static', 'online'].map((format) => (
                                    <option key={format} value={format}>{format}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter_block">
                            <select name="courseType" value={filters.courseType || 'all'} onChange={handleChange}>
                                <option value="all">All types</option>
                                {['pro', 'minimal', 'premium', 'incubator', 'vip'].map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter_block">
                            <select name="status" value={filters.status || 'all'} onChange={handleChange}>
                                <option value="all">All statuses</option>
                                {['In Work', 'New', 'Aggre', 'Disaggre', 'Dubbing'].map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter_block">
                            <select name="group" value={filters.group || 'all'} onChange={handleChange}>
                                <option value="all">All groups</option>
                                {groups.map((group) => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter_block">
                            <input type="text" name="startDate" placeholder="Start date (e.g., January 5, 2024)"
                                   value={filters.startDate || ''} onChange={handleChange}/>
                        </div>
                        <div className="filter_block">
                            <input type="text" name="endDate" placeholder="End date (e.g., January 10, 2024)"
                                   value={filters.endDate || ''} onChange={handleChange}/>
                        </div>
                    </div>
                </div>
                <div className="filter_checkbox">
                    <input id="my" type="checkbox" checked={filters.onlyMy === "true"} onChange={handleCheckboxChange}></input>
                    <label htmlFor="my">My</label>
                </div>
                <div className="section_buttons">
                    <button className="reset_button" onClick={() => (resetFilters())}></button>
                    <button className="excel_button" onClick={() => (exportAllOrdersToExcel())}></button>
                </div>
            </div>
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
                            style={{cursor: 'pointer'}}
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
                                                            {index !== comments.length - 1 && <hr/>}
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
                    <div className="modal_contents">
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
                                                            setEditableOrder({
                                                                ...editableOrder,
                                                                groupName: e.target.value
                                                            })}>
                                                    {groups.map((group) => (
                                                        <option key={group} value={group}
                                                                selected={group === editableOrder?.groupName}>
                                                            {group}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button className="first_button" type="button" onClick={() =>
                                                    setModalMode("add_group")}>ADD GROUP
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="block">
                                                <input
                                                    type="text"
                                                    id="group"
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
                                        {['In Work', 'New', 'Agree', 'Disagree', 'Dubbing'].map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal_row">
                                <div className="modal_block">
                                    <label>
                                        Name
                                    </label>
                                    <input type="text" placeholder="Name" value={editableOrder?.name || ""}
                                           onChange={(e) =>
                                               setEditableOrder({...editableOrder, name: e.target.value})}
                                    />
                                </div>
                                <div className="modal_block">
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
                                <div className="modal_block">
                                    <label>
                                        Surname
                                    </label>
                                    <input type="text" placeholder="Surname" value={editableOrder?.surname || ""}
                                           onChange={(e) =>
                                               setEditableOrder({...editableOrder, surname: e.target.value})}
                                    />
                                </div>
                                <div className="modal_block">
                                    <label>
                                        Already paid
                                    </label>
                                    <input type="number" placeholder="Already paid"
                                           value={editableOrder?.alreadyPaid || ""}
                                           onChange={(e) =>
                                               setEditableOrder({...editableOrder, alreadyPaid: +e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal_row">
                                <div className="modal_block">
                                    <label>
                                        Email
                                    </label>
                                    <input type="email" placeholder="Email" value={editableOrder?.email || ""}
                                           onChange={(e) =>
                                               setEditableOrder({...editableOrder, email: e.target.value})}
                                    />
                                </div>
                                <div className="modal_block">
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
                                <div className="modal_block">
                                    <label>
                                        Phone
                                    </label>
                                    <input type="tel" placeholder="Phone" value={editableOrder?.phone || ""}
                                           onChange={(e) =>
                                               setEditableOrder({...editableOrder, phone: e.target.value})}
                                    />
                                </div>
                                <div className="modal_block">
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
                                <div className="modal_block">
                                    <label>
                                        Age
                                    </label>
                                    <input type="number" placeholder="Age" value={editableOrder?.age || ""}
                                           onChange={(e) =>
                                               setEditableOrder({...editableOrder, age: +e.target.value})}
                                    />
                                </div>
                                <div className="modal_block">
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
                            <div className="modal_edit_buttons">
                                <button type="button" onClick={() => setModalInfoOpen(false)}>CLOSE</button>
                                <button type='submit' form='modal_rows'>SUBMIT</button>
                            </div>
                        </form>
                    </div>
                </ModalComponent>
            </section>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default OrdersComponent;