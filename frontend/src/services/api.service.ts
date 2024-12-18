import axios from "axios";
import {baseURL} from "../constants/urls";

const token = localStorage.getItem('accessToken');
const axiosInstance = axios.create({
    baseURL:baseURL,
    headers:{
        Authorization: 'Bearer ' + token
    }
});

export {
    axiosInstance
}