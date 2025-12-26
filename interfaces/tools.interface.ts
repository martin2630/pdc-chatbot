export interface WeatherParams {
  latitude: number;
  longitude: number;
}

export interface GetUsersDetailsParams {
  id?: number;
}

export interface GetPredialParams {
  rfc: string;
  claveCatastral: string;
}

export interface GetPredialDummyParams {
  rfc: string;
  claveCatastral: string;
}

export interface GetPaseCajaParams {
  referenciaCodigo: string;
}

export interface GetPagoEnLineaParams {
  referenciaCodigo: string;
}
