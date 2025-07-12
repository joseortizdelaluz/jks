export interface Branch {
    id?: number;
    company_id?: number;
    nombre: string;
    serie?: string;

    calle?: string;
    num_ext?: string;
    num_int?: string;
    colonia?: string;
    referencia?: string;
    municipio_id?: number;
    estado_id?: number;
    pais_id?: number;
    cp?: string;

    telefono?: string;
    is_active: boolean;
}