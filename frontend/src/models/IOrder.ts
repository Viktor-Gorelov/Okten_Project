import {IComment} from "./IComment";

export interface IOrder {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: number;
    course: string;
    courseFormat: string;
    courseType: string;
    status: string;
    sum: number;
    alreadyPaid: number;
    createdAt: string;
    manager: string;
    groupName: string;
    msg: string;
    utm: string;
    commentList: IComment[];
}