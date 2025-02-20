import React, {useEffect, useState} from 'react';
import "../AdminPanel.css"
import {ModalComponent} from "./ModalComponent";
import {IManager} from "../models/IManager";

const AdminPanelComponent = () => {
    const [managers, setManagers] = useState<IManager[]>([])
    const [orderStats, setOrderStats] = useState<Record<string, number>>({});
    const [managerStats, setManagerStats] = useState<Record<string, Record<string, number>>>({});
    const [orderError, setOrderError] = useState<string | null>(null);
    const [managerError, setManagerError] = useState<string | null>(null);
    const [modalCreateIsOpen, setModalCreateOpen] = useState(false);
    const [email, setEmail] = useState<string | null>("")
    const [name, setName] = useState<string | null>("")
    const [surname, setSurname] = useState<string | null>("")

    const fetchManagers = async () =>{
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch("/api/users/managers", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch managers");

            const data = await response.json();
            setManagers(data.content);
        }
        catch (error) {
            console.error("Error fetching managers:", error);
            setManagerError("Failed to load managers");
        }
    };

    const fetchOrderStats = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch("/api/orders/statistics", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch statistics");

            const data = await response.json();
            setOrderStats(data);
        } catch (error) {
            console.error("Error fetching statistics:", error);
            setOrderError("Failed to load statistics");
            await fetchOrderStats();
        }
    };

    const fetchManagersStats = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch("/api/orders/managers/statistics", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch manager statistics");

            const data = await response.json();
            setManagerStats(data);
        } catch (error) {
            console.error("Error fetching manager statistics:", error);
        }
    };

    useEffect(() => {
        fetchManagers();
        fetchOrderStats();
        fetchManagersStats();
    }, []);

    const openModal = () => {
        setModalCreateOpen(true)
    }

    const createManager = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: email,
                    name: name,
                    surname: surname
                }),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                console.error('Failed to create manager:', errorDetails);
                throw new Error(`Error: ${response.status}`);
            }
            setModalCreateOpen(false);
            await fetchManagers();

        } catch (error) {
            console.error('Error create manager:', error);
            alert('Failed to create manager. Please try again.');
        }
    }

    const activateManager = async (userId: number) => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`/api/auth/activate/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to generate activation link");
            }
            const data = await response.json();
            await navigator.clipboard.writeText(data.activationLink);
            alert("Activation link copied to clipboard!");
        } catch (error) {
            console.error("Error generating activation link:", error);
        }
    };

    const changeBanStatusForUser = async (manager: IManager, banStatus: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`/api/users/${banStatus}/${manager.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to ban manager");
            alert(`Manager ${banStatus === "ban" ? "banned" : "unbanned"} successfully`);
            await fetchManagers();
        }
        catch (error) {
            console.error(`Error ${banStatus === "ban" ? "banned" : "unbanned"} manager:`, error);
            setManagerError(`Failed to ${banStatus === "ban" ? "banned" : "unbanned"} manager`);
        }
    }

    return (
        <div className="admin_panel">
            <div className="statistics">
                <p>Orders Statistics</p>
                {orderError ? (
                    <p>{orderError}</p>
                ) : (
                    <div className="stats">
                        <p>Total: {orderStats.total || 0}{" "}</p>
                        <p>Agree: {orderStats.agree || 0}{" "}</p>
                        <p>In Work: {orderStats.in_work || 0}{" "}</p>
                        <p>Disagree: {orderStats.disagree || 0}{" "}</p>
                        <p>Dubbing: {orderStats.dubbing || 0}{" "}</p>
                        <p>New: {orderStats.new || 0}</p>
                    </div>
                )}
            </div>
            <div className="create_button">
                <button onClick={openModal}>CREATE</button>
            </div>
            <div className="managers_blocks">
                {managers.map(manager => {
                    return (
                        <>
                            <div className="manager_block">
                                <div className="manager_info">
                                    <p>id: {manager.id} </p>
                                    <p>email: {manager.email} </p>
                                    <p>name: {manager.name} </p>
                                    <p>surname: {manager.surname} </p>
                                    <p>is_active: {manager.isActive ? 'true' : 'false'} </p>
                                    <p>last_login: {manager.lastLogin}</p>
                                </div>
                                <div className="manager_stats">
                                    {managerError ? (
                                        <p>{managerError}</p>
                                    ) : (
                                        <>
                                            <p>Total: {managerStats[manager.name] ?
                                                managerStats[manager.name].total : 0} </p>
                                            {managerStats[manager.name]?.agree ? (
                                                <p>Agree: {managerStats[manager.name].agree}</p>
                                            ) : null}

                                            {managerStats[manager.name]?.inWork ? (
                                                <p>In Work: {managerStats[manager.name].inWork}</p>
                                            ) : null}

                                            {managerStats[manager.name]?.disagree ? (
                                                <p>Disagree: {managerStats[manager.name].disagree}</p>
                                            ) : null}

                                            {managerStats[manager.name]?.dubbing ? (
                                                <p>Dubbing: {managerStats[manager.name].dubbing}</p>
                                            ) : null}

                                            {managerStats[manager.name]?.new ? (
                                                <p>New: {managerStats[manager.name].new}</p>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                                <div className="manager_buttons">
                                    {
                                        manager.isActive ? (
                                                <button type="button" onClick={() =>
                                                    activateManager(manager.id)}>RECOVERY PASSWORD</button>
                                            ):
                                            <button type="button" onClick={() =>
                                                activateManager(manager.id)}>ACTIVATE</button>
                                    }
                                    <button type="button" onClick={() =>
                                        changeBanStatusForUser(manager, "ban")}>BAN</button>
                                    <button type="button" onClick={() =>
                                        changeBanStatusForUser(manager, "unban")}>UNBAN</button>
                                </div>
                            </div>
                        </>
                    )
                }
                )}
            </div>
            <ModalComponent isOpen={modalCreateIsOpen} onClose={() => setModalCreateOpen(false)}>
                <div className="modal_content">
                    <form id="create_manager" onSubmit={createManager}>
                        <div className="blocks">
                            <div className="block">
                                <label>Email</label>
                                <input type="text" id="email" onChange={(e) =>
                                    setEmail(e.target.value)} placeholder="Email"/>
                            </div>
                            <div className="block">
                                <label>Name</label>
                                <input type="text" id="name" onChange={(e) =>
                                    setName(e.target.value)} placeholder="Name"/>
                            </div>
                            <div className="block">
                                <label>Surname</label>
                                <input type="text" id="surname" onChange={(e) =>
                                    setSurname(e.target.value)} placeholder="Surname"/>
                            </div>
                        </div>
                        <div className="modal_button">
                            <button type="button" onClick={() => setModalCreateOpen(false)}>CANCEL</button>
                            <button type='submit' form='create_manager'>CREATE</button>
                        </div>
                    </form>
                </div>
            </ModalComponent>
        </div>
    );
};

export default AdminPanelComponent;