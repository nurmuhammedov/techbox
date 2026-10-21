export type Stage = 'gofra' | 'fleksa' | 'tikish' | 'yelimlash'
export const STAGES: Stage[] = ['gofra', 'fleksa', 'tikish', 'yelimlash']

export interface Me {
  id: number
  username: string
  display_name: string
  language: string
  is_superuser: boolean
  role: { id: number; name: string; home: string } | null
  permissions: string[]
}

export interface Customer {
  id: number
  company: string
  contact_name: string
  phone: string
  tin: string
  since_year: number | null
  note: string
  orders_count: number
  created_at: string
}

export interface MaterialType {
  id: number
  name: string
  seller_name: string
  gsm: number
}

export interface Format {
  id: number
  width_mm: number
}

export interface Shape {
  kind: 'box' | 'sheet'
  length: number | null
  width: number | null
  height: number | null
  joint: number | null
  sheet_length: number | null
  sheet_width: number | null
  layers: number[]
  route: Stage[]
  l0: number | null
  l1: number | null
  l2: number | null
  l3: number | null
  l4: number | null
  l5: number | null
}

export interface Product extends Shape {
  id: number
  customer: number | null
  customer_name: string | null
  name: string
  logo: string | null
  note: string
  is_active: boolean
}

export type OrderStatus = 'new' | 'planned' | 'in_production' | 'done' | 'cancelled'

export interface Order extends Shape {
  id: number
  number: string
  customer: number
  customer_name: string
  product: number | null
  name: string
  logo: string | null
  quantity: number
  price: number | null
  deadline: string | null
  comment: string
  status: OrderStatus
  progress: { id: number; number: string; stage: Stage | null; state: ItemState; qty: number; route: Stage[]; step: number }[]
  created_by_name: string | null
  created_at: string
}

export type ItemState = 'waiting' | 'in_work' | 'done' | 'cancelled'

export interface StageRun {
  id: number
  stage: Stage
  operator_name: string | null
  qty_in: number
  qty_out: number | null
  waste_kg: number | null
  note: string
  started_at: string
  finished_at: string | null
}

export interface WorkItem {
  id: number
  number: string
  kind: 'order' | 'pallet'
  name: string
  batch: number
  batch_number: string
  format_mm: number
  order: number | null
  order_number: string | null
  customer_name: string | null
  size: string | null
  width: number | null
  length: number | null
  route: Stage[]
  step: number
  stage: Stage | null
  next_stage: Stage | null
  state: ItemState
  planned_qty: number
  qty: number
  sold_qty: number
  available_qty: number
  operator: number | null
  operator_name: string | null
  warehouse_name: string | null
  deadline: string | null
  logo: string | null
  note: string
  created_at: string
  finished_at: string | null
  runs?: StageRun[]
  layers?: number[]
  shape?: ItemShape
}

export interface ItemShape {
  kind: 'box' | 'sheet' | 'pallet'
  parts: number
  orientation: 'horizontal' | 'vertical'
  ups: number
  length: number | null
  width: number | null
  height?: number | null
  joint?: number | null
  sheet_length?: number | null
  sheet_width?: number | null
  l0?: number | null
  l1?: number | null
  l2?: number | null
  l3?: number | null
  l4?: number | null
  l5?: number | null
}

export interface PlanLine {
  order_id: number
  name: string
  quantity: number
  ups: number
  parts: number
  orientation: 'horizontal' | 'vertical'
  blank_across: number
  blank_along: number
  lane_width: number
  sheets: number
  run_m: number
}

export interface Plan {
  format_mm: number
  trim_mm: number
  used_mm: number
  offcut_mm: number
  run_m: number
  lines: PlanLine[]
  pallet: { width: number; length: number; count: number } | null
  materials: { layer: number; material_id: number; fluted: boolean; kg: number; available?: number; enough?: boolean }[]
  glue_m2: number
  stock_ok?: boolean
  warnings: string[]
}

export type BatchStatus = 'draft' | 'ready' | 'in_work' | 'done' | 'cancelled'

export interface Allocation {
  id: number
  layer: number
  roll: number
  roll_label: string
  weight: number
  weight_before: number
  weight_after: number | null
  consumed: number | null
}

export interface Batch {
  id: number
  number: string
  format: number
  format_mm: number
  layers: number[]
  status: BatchStatus
  plan: Plan & { legacy_group?: number }
  priority: number
  operator: number | null
  operator_name: string | null
  glue: number | null
  glue_name: string | null
  glue_amount: number | null
  waste_kg: number | null
  started_at: string | null
  finished_at: string | null
  comment: string
  lines: { id: number; order: number; order_number: string; order_name: string; customer_name: string; quantity: number; ups: number; parts: number; orientation: 'horizontal' | 'vertical' }[]
  items: WorkItem[]
  allocations: Allocation[]
  created_at: string
}

export interface Roll {
  id: number
  code: string
  warehouse: number
  warehouse_name: string
  material: number
  material_name: string
  gsm: number
  format: number
  format_mm: number
  supplier: number | null
  supplier_name: string | null
  country: number | null
  country_name: string | null
  initial_weight: number
  remaining_weight: number
  reserved_weight: number
  available_weight: number
  price_per_kg: number | null
  status: 'in_stock' | 'empty'
  created_at: string
}

export interface Notification {
  id: number
  kind: string
  level: 'info' | 'success' | 'warning' | 'danger'
  title: string
  body: string
  link: string
  read_at: string | null
  created_at: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  home: string
  users_count: number
}

export interface User {
  id: number
  username: string
  display_name: string
  first_name: string
  last_name: string
  employee: number | null
  role: number | null
  role_name: string | null
  is_active: boolean
  is_superuser: boolean
  language: string
  last_login: string | null
}

export interface Employee {
  id: number
  first_name: string
  last_name: string
  middle_name: string
  full_name: string
  phone: string
  position: number | null
  position_name: string | null
  birthday: string | null
  passport: string
  pinfl: string
  address: string
  card_number: string
  hired_at: string | null
  is_active: boolean
  blacklisted: boolean
  blacklist_reason: string
  username: string | null
}
