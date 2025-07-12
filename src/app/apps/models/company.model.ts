export interface CompanySelect {
    id: number;
    razon_social: string;
    rfc?: string;
}

export interface BranchSelect {
    id?: number;
    nombre: string;
}

export interface CompanySelectExt {
    id: number;
    razon_social: string;
    sucursales: BranchSelect[]
}

export interface Company {
    id: number;
    razon_social: string;
    rfc?: string;
}
