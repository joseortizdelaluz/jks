import { Session } from "./session";

export interface IUser {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    is_superuser?: boolean;
    is_staff?: boolean;
    is_active?: boolean;
    staff_id?: number;
    password?: string;
    repassword?: string;
    clientes?: any[];
    empresas?: any[];
}


export class User{
    constructor(
        public id?: number,
        public first_name?: string,
        public last_name?: string,
        public email?: string,
        public is_superuser?: boolean,
        public is_staff?: boolean,
        public is_active?: boolean,
        public staff_id?: number,
        public password?: string,
        public repassword?: string,
        public clientes?: any[],
        public empresas?: any[],
    ){}

    static fromJson(json: any): User{
        return new User(
            json["id"],
            json["first_name"],
            json["last_name"],
            json["email"],
            json["is_superuser"],
            json["is_staff"],
            json["is_active"],
            json["staff_id"],
        );
    }
}