import dayjs from 'dayjs'

export function num(value: number | string | null | undefined, digits = 0) {
  if (value === null || value === undefined || value === '') return '—'
  return Number(value).toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function kg(value: number | string | null | undefined) {
  return value === null || value === undefined ? '—' : `${num(value, Number(value) % 1 ? 1 : 0)} kg`
}

export function money(value: number | string | null | undefined) {
  return value === null || value === undefined ? '—' : `${num(value, 0)} so'm`
}

export function date(value: string | null | undefined) {
  return value ? dayjs(value).format('DD.MM.YYYY') : '—'
}

export function dateTime(value: string | null | undefined) {
  return value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—'
}

export function daysLeft(value: string | null | undefined) {
  if (!value) return null
  return dayjs(value).startOf('day').diff(dayjs().startOf('day'), 'day')
}

export function isoDate(value: Date | string | null | undefined) {
  return value ? dayjs(value).format('YYYY-MM-DD') : null
}
