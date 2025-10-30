
export enum PunchType {
  Entrada = 'Entrada',
  SaidaAlmoco = 'Saída Almoço',
  EntradaAlmoco = 'Entrada Almoço',
  Saida = 'Saída',
}

export interface TimePunch {
  type: PunchType;
  time: string;
}

export interface WorkedHours {
  employee: string;
  monthYear: string;
  totalHours: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
   