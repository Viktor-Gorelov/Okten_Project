import React from 'react';
import HeaderComponent from "../components/HeaderComponent";
import AdminPanelComponent from "../components/AdminPanelComponent";
import {Pagination} from "reactstrap";

const AdminPanelPage = () => {
    return (
        <div>
            <HeaderComponent/>
            <AdminPanelComponent/>
        </div>
    );
};

export default AdminPanelPage;