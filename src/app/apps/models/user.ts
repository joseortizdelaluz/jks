import { ServiceType, TypeAccount } from "../enums";

export interface IUser{
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    is_active?: boolean;
    is_staff?: boolean;
}

export interface ISession{
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    is_active?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    created_at?: string;
    service?: IService;
    has_image?: boolean;
}

export interface IService{
    multi_rfc: boolean;
    razon_social: string;
    rfc: string;
    service_type?: ServiceType;
    type_account?: TypeAccount;
    total_timbres?: number;
}
