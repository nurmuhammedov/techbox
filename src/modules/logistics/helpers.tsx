import {ReactNode} from 'react'
import {ISelectOption} from 'interfaces/form.interface'


type Row = Record<string, any>

export const FUEL_TYPES: ISelectOption[] = [
	{value: 'petrol', label: 'Benzin'},
	{value: 'diesel', label: 'Dizel'},
	{value: 'methane', label: 'Metan'},
	{value: 'propane', label: 'Propan'},
	{value: 'electric', label: 'Elektr'},
	{value: 'hybrid', label: 'Gibrid'}
]

export const TRANSPORT_STATUSES: ISelectOption[] = [
	{value: 'available', label: 'Mavjud'},
	{value: 'busy', label: 'Band'},
	{value: 'in_repair', label: 'Ta’mirda'},
	{value: 'in_maintenance', label: 'Texnik xizmatda'},
	{value: 'accident', label: 'YTH'}
]

export const LICENSE_CATEGORIES: ISelectOption[] = ['B', 'C', 'D', 'BE', 'CE', 'DE', 'BC', 'BCE', 'BCDE']
	.map(c => ({value: c, label: c}))

export const MAINTENANCE_TYPES: ISelectOption[] = [
	{value: 'oil_change', label: 'Moy almashtirish'},
	{value: 'tire_service', label: 'Shina'},
	{value: 'brake_system', label: 'Tormoz tizimi'},
	{value: 'engine_repair', label: 'Dvigatel ta’miri'},
	{value: 'electrical', label: 'Elektr tizimi'},
	{value: 'scheduled_inspection', label: 'Rejali texnik ko‘rik'},
	{value: 'other', label: 'Boshqa'}
]

export const MAINTENANCE_STATUSES: ISelectOption[] = [
	{value: 'scheduled', label: 'Rejalashtirilgan'},
	{value: 'in_progress', label: 'Jarayonda'},
	{value: 'completed', label: 'Yakunlangan'},
	{value: 'cancelled', label: 'Bekor qilingan'}
]

export const PAYMENT_METHODS: ISelectOption[] = [
	{value: 'cash', label: 'Naqd'},
	{value: 'card', label: 'Karta'},
	{value: 'bank_transfer', label: 'Pul o‘tkazish'}
]

export const RETURN_REASONS: ISelectOption[] = [
	{value: 'damaged', label: 'Shikastlangan / yaroqsiz'},
	{value: 'customer_rejected', label: 'Mijoz rad etdi'},
	{value: 'wrong_dimension', label: 'Noto‘g‘ri o‘lcham'},
	{value: 'over_order', label: 'Ortiqcha buyurtma'},
	{value: 'other', label: 'Boshqa'}
]

export const RETURN_DECISIONS: ISelectOption[] = [
	{value: 'restock', label: 'Omborga qaytarish'},
	{value: 'rework', label: 'Qayta ishlashga'},
	{value: 'scrap', label: 'Brak / hisobdan chiqarish'}
]

export const INCIDENT_TYPES: ISelectOption[] = [
	{value: 'breakdown', label: 'Texnik nosozlik'},
	{value: 'accident', label: 'YTH'},
	{value: 'tire_puncture', label: 'Balon yorilishi'},
	{value: 'engine_issue', label: 'Dvigatel nosozligi'},
	{value: 'other', label: 'Boshqa'}
]

export const INCIDENT_SEVERITIES: ISelectOption[] = [
	{value: 'low', label: 'Past'},
	{value: 'medium', label: 'O‘rta'},
	{value: 'high', label: 'Yuqori'},
	{value: 'critical', label: 'Favqulodda'}
]

export const INCIDENT_STATUSES: ISelectOption[] = [
	{value: 'reported', label: 'Xabar berildi'},
	{value: 'in_review', label: 'Ko‘rib chiqilmoqda'},
	{value: 'resolved', label: 'Hal etildi'}
]

export const SEVERITY_COLORS: Record<string, string> = {low: '#64748b', medium: '#b45309', high: '#b91c1c', critical: '#991b1b'}
export const INCIDENT_COLORS: Record<string, string> = {reported: '#b91c1c', in_review: '#b45309', resolved: '#15803d'}
export const RETURN_COLORS: Record<string, string> = {pending: '#b45309', inspected: '#15803d'}

export const SHIPMENT_STATUSES: Record<string, {label: string, color: string}> = {
	new: {label: 'Yangi', color: '#2563eb'},
	packed: {label: 'Tayyor', color: '#0f766e'},
	loading_queue: {label: 'Yuklash navbatida', color: '#b45309'},
	loaded: {label: 'Yuklandi', color: '#7c3aed'},
	in_transit: {label: 'Yo‘lda', color: '#0369a1'},
	delivered: {label: 'Yetkazildi', color: '#15803d'},
	returned: {label: 'Qaytarildi', color: '#b91c1c'},
	cancelled: {label: 'Bekor qilindi', color: '#6b7280'}
}

export const TRIP_STATUSES: Record<string, {label: string, color: string}> = {
	planned: {label: 'Rejalashtirilgan', color: '#1d4ed8'},
	loaded: {label: 'Yuklangan', color: '#7c3aed'},
	in_transit: {label: 'Yo‘lda', color: '#0369a1'},
	completed: {label: 'Yakunlangan', color: '#15803d'},
	cancelled: {label: 'Bekor qilingan', color: '#6b7280'}
}

export const Badge = ({label, color}: {label: string, color: string}) => (
	<span style={{
		display: 'inline-block',
		padding: '.2rem .8rem',
		borderRadius: '1rem',
		fontSize: '.8125rem',
		fontWeight: 500,
		color,
		fontFamily: PAGE_FONT.fontFamily,
		background: `${color}1a`,
		whiteSpace: 'nowrap'
	}}>
		{label}
	</span>
)

export const ShipmentBadge = ({status}: {status: string}) => {
	const s = SHIPMENT_STATUSES[status] ?? {label: status, color: '#6b7280'}
	return <Badge label={s.label} color={s.color}/>
}

export const TripBadge = ({status}: {status: string}) => {
	const s = TRIP_STATUSES[status] ?? {label: status, color: '#6b7280'}
	return <Badge label={s.label} color={s.color}/>
}

export const labelOf = (options: ISelectOption[], value: unknown) =>
	options.find(o => o.value === value)?.label ?? (value as string) ?? '-'

export const money = (v: unknown) => v === null || v === undefined || v === '' ? '-' : Number(v).toLocaleString('ru-RU').replace(/,/g, ' ')

export const date = (v?: string | null) => v ? new Date(v).toLocaleDateString('ru-RU') : '-'

export const dateTime = (v?: string | null) => v ? new Date(v).toLocaleString('ru-RU', {
	day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '-'

export const transportLabel = (r: Row) => [r.plate_number, r.model_name].filter(Boolean).join(' · ')
export const driverLabel = (r: Row) => r.employee_name || `#${r.id}`
export const index = (page: number, pageSize: number) => ({
	Header: '№',
	accessor: (_: Row, i: number) => (page - 1) * pageSize + i + 1,
	style: {width: '3rem', textAlign: 'center' as const}
})

// pages here use plain divs, which do not get the app font from the shared components
export const PAGE_FONT = {fontFamily: 'Poppins, Arial, Helvetica, sans-serif'}
// lets the table inside shrink to the free height
export const PAGE_BODY = {...PAGE_FONT, minHeight: 0}

export const STAT_GRID = {display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))'}

export const StatCard = ({label, value, hint, hintColor, onClick}: {
	label: string,
	value: ReactNode,
	hint?: string,
	hintColor?: string,
	onClick?: () => void
}) => {
	const Tag = onClick ? 'button' : 'div'
	return (
		<Tag
			type={onClick ? 'button' : undefined}
			onClick={onClick}
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '.25rem',
				padding: '1rem 1.25rem',
				background: '#fff',
				border: '1px solid var(--gray-pale)',
				borderRadius: '.625rem',
				cursor: onClick ? 'pointer' : undefined,
				font: 'inherit',
				textAlign: 'left'
			}}
		>
			<span style={{color: '#64748b', fontSize: '.875rem'}}>{label}</span>
			<span style={{color: '#1e293b', fontSize: '1.625rem', fontWeight: 600, whiteSpace: 'nowrap'}}>{value}</span>
			{hint && <span style={{color: hintColor, fontSize: '.8125rem'}}>{hint}</span>}
		</Tag>
	)
}
