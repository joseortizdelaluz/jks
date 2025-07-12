import { Exportacion, TypeDocument } from "./types";


export interface IProductoServicio {
    id: number;
    clave?: string;
    descripcion?: string;
}

export interface IUnidadMedida {
    id: number;
    clave?: string;
    descripcion?: string;
}

export interface ITax{
    tax_id: number;
    nombre?: string;
    impuesto?: string;
    valor?: number;
    tipo?: string;
}

export interface IDocumentPay {
    document_id: number;
    folio_fiscal?: string;
    divisa_id?: number;
    tipo_cambio?: number;
    equivalencia?: number;
    total?: number;
    resta?: number;
    completo?: boolean;
    abono?: boolean;
    impuestos?: any[],
}

export interface IIDocument {
    tipo: TypeDocument;
    rfcEmisor: string
    sucursal: string
    rfcReceptor: string
    usoCFDI: string
    exportacion: Exportacion
    divisa: string
    tipoCambio: number
    formaPago: string
    metodoPago: string
    condicionesPago: string
    serie: string

    observaciones: string
    impuestosLocales: string

    concepto: string
    cantidad: number
    precioUnitario: number
    descuento: number
    productoServicio: string
    claveUnidad: string
    impuestosFederales: string
    
    // CONCEPTO
    // CANTIDAD
    // PRECIO UNITARIO
    // DESCUENTO
    // PRODUCTO SERVICIO
    // CLAVE UNIDAD
    // IMPUESTOS FEDERALES
}


