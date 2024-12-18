import {createBrowserRouter, RouteObject} from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import OrdersPage from "../pages/OrdersPage";


const routes: RouteObject[] = [
    {path:'',element:<App/>,children:[
            {path: '/login', element:<LoginPage/>},
            {path: '/orders', element:<OrdersPage/>}
        ]}
]

export const router = createBrowserRouter(routes);