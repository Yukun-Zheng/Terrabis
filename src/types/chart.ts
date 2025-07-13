export type ChartType =
  | 'pie'
  | 'bar'
  | 'line'
  | 'radar'
  | 'polarArea'
  | 'bubble'
  | 'scatter'
  | 'area'
  | 'stackedBar'
  | 'stackedArea';

export interface ChartDataPoint {
  label: string;
  value: number;
} 