export enum TipoImpuesto{
    ISR = '001',
    IVA = '002',
    IEPS = '003',
    LOCAL = 'LOCAL',
}

export enum TasaCuota{
    Tasa = 'Tasa',
    Cuota = 'Cuota',
    Exento = 'Exento',
}

export enum TrasladoRetencion{
    Traslado = 'traslado',
    Retencion = 'retencion',
}

export enum TypeDocument {
    Ingreso = 'I',
    Egreso = 'E',
    Pago = 'P',
    Traslado = 'T',
    // Nomina = 'N'
}

export enum StatusCfdi{
    Pendiente = 0,
    Sellado = 1,
    Cancelado = 2,
    Sellando = 4,
    Cancelado_aceptacion = 5,
}

export enum StatusCfdiFilter{
    Todos = '',
    'Sellados y cancelados' = '1, 2, 5',
    Sellados = '1',
    Cancelados = '2, 5',
    Pendientes = '0',
}

export enum DateType {
    'Fecha emisión' = 'fecha_emision',
    'Fecha certificación' = 'fecha_certificacion',
    'Fecha cancelación' = 'fecha_cancelacion',
}

export enum Exportacion {
    'No aplica' = '01',
    Definitiva = '02',
    Temporal = '03',
}

export enum ObjetoImpuesto {
    no_objeto_impuesto = '01',
    si_objeto_impuesto = '02',
    si_objeto_impuesto_no_desglose = '03',
}

export enum TypeProduct {
    inventario='I',
    servicio='S',
    kit = 'K'
}

export enum OrigenProduct {
    nacional = 'N',
    importado = 'I',
}

export enum Status {
    pendiente = 0,
    ok = 1,
    no = 2, 
}

export enum TypeAccount {
    free = 'F',
    pay = 'P',
    
}

export enum ServiceType {
    prepago = 'P',
    on_demand = 'D',
}

export enum ServiceEmail {
    gmail='gmail',
    yahoo='yahoo',
    outlook = 'outlook',
    local = 'local',
    propio = 'propio',
};