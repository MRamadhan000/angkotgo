export interface Tarif {
  id: number;
  name: string;
  nominal: number;
  createdAt: string;
  updated_at: string;
}

export interface CreateTarifRequest {
  name: string;
  nominal: number;
}

export interface UpdateTarifRequest {
  name?: string;
  nominal?: number;
}

export interface TarifResponse {
  message: string;
  data: Tarif;
}

export interface TarifsResponse {
  message: string;
  data: Tarif[];
}

export interface DeleteTarifResponse {
  message: string;
}
