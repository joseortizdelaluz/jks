export interface IPais {
    id: number;
    clave: string;
    descripcion: string,
}
export interface IEstado {
    id: number;
    clave?: string;
    clave_pais?: string;
    descripcion: string;
    clave_numerica?: number;
}

export interface IMunicipio {
    id: number;
    clave?: string;
    clave_estado?: string;
    descripcion: string;
}

export interface IColonia {
    id: number;
    cp: string;
    asenta: string;
    municipio: number;
    estado: number;
}

export interface IRegimen {
    id: number;
    clave: string;
    descripcion: string;
}

export interface IUsoCFDI {
    id: number;
    clave: string;
    descripcion: string;
}

export interface IDivisa{
    id: number;
    clave: string;
    descripcion: string;
}

export interface IFormaPago {
    id?: number;
    clave?: string;
    descripcion: string;
}