export interface IRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: Array<number> | string;
}

export interface IRequestSignal {
  type: 'request';
  payload: IRequest;
  timestamp: number;
  origin: 'NSURLSession' | 'NSURLRequest';
}