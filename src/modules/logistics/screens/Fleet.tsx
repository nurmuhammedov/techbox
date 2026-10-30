import {PageTitle, Tab} from 'components'
import {useData, useSearchParams} from 'hooks'
import {useCallback} from 'react'
import Crud, {ICrudField} from '../components/Crud'
import {
	Badge,
	date,
	dateTime,
	driverLabel,
	FUEL_TYPES,
	index,
	LICENSE_CATEGORIES,
	MAINTENANCE_STATUSES,
	MAINTENANCE_TYPES,
	money,
	TRANSPORT_STATUSES,
	PAGE_FONT,
	transportLabel
} from '../helpers'


type Row = Record<string, any>

const TABS = [
	{value: 'dashboard', label: 'Umumiy'},
	{value: 'transports', label: 'Mashinalar'},
	{value: 'drivers', label: 'Haydovchilar'},
	{value: 'assignments', label: 'Biriktirish'},
	{value: 'factories', label: 'Mijoz zavodlari'},
	{value: 'fuel', label: 'Yoqilg‘i'},
	{value: 'maintenance', label: 'Texnik xizmat'},
	{value: 'models', label: 'Modellar'},
	{value: 'brands', label: 'Markalar'}
]

const TRANSPORT_COLORS: Record<string, string> = {
	available: '#16a34a', busy: '#d97706', in_repair: '#dc2626', in_maintenance: '#7c3aed', accident: '#b91c1c'
}

const transportPicker: ICrudField = {
	name: 'transport', label: 'Mashina', type: 'select', required: true,
	source: {endpoint: 'logistics/transports/select', label: transportLabel}
}
const driverPicker = (name: string, label: string, required = true): ICrudField => ({
	name, label, type: 'select', required,
	source: {endpoint: 'logistics/drivers/select', label: driverLabel}
})
const id = (v: unknown) => (v && typeof v === 'object' ? (v as Row).id : v)

// each card shows the count and how it moved against last month
const CARDS = [
	{key: 'transport', label: 'Faol mashinalar'},
	{key: 'driver', label: 'Haydovchilar'},
	{key: 'delivery', label: 'Bu oy yetkazildi'},
	{key: 'delayed_order', label: 'Kechikkan'},
	{key: 'fuel_expense', label: 'Yoqilg‘i xarajati (oy)', money: true},
	{key: 'returned_order', label: 'Qaytarilgan'}
]

const Dashboard = () => {
	const {data: cards} = useData<Row>('logistics/dashboard/cards')
	const {data: statuses = []} = useData<Row[]>('logistics/dashboard/transport-statuses')
	return (
		<div className="flex flex-col gap-lg">
			<div className="grid gap-lg">
				{CARDS.map(c => {
					const value = cards?.[c.money ? c.key : `${c.key}_count`] ?? 0
					const change = Number(cards?.[`${c.key}_prtg`] ?? 0)
					return (
						<div key={c.key} className="span-4" style={{background: '#fff', borderRadius: '1rem', padding: '1.6rem'}}>
							<div style={{color: '#64748b', fontSize: '1.3rem'}}>{c.label}</div>
							<div style={{fontSize: '2.4rem', fontWeight: 600, whiteSpace: 'nowrap'}}>
								{c.money ? `${money(value)} so‘m` : value}
							</div>
							<div style={{fontSize: '1.2rem', color: change > 0 ? '#16a34a' : change < 0 ? '#dc2626' : '#94a3b8'}}>
								{change > 0 ? '+' : ''}{change}% o‘tgan oyga nisbatan
							</div>
						</div>
					)
				})}
			</div>
			{Array.isArray(statuses) && statuses.length > 0 && (
				<div style={{background: '#fff', borderRadius: '1rem', padding: '1.6rem'}}>
					<div style={{fontWeight: 600, marginBottom: '1rem'}}>Mashinalar holati</div>
					<div className="flex flex-col gap-sm">
						{statuses.map((st: Row) => (
							<div key={st.status} className="flex align-center gap-lg">
								<span style={{width: '12rem'}}>{st.status}</span>
								<div style={{flex: 1, background: '#f1f5f9', borderRadius: '.4rem', height: '.8rem'}}>
									<div style={{width: `${st.percentage}%`, background: '#2563eb', height: '100%', borderRadius: '.4rem'}}/>
								</div>
								<span style={{width: '6rem', textAlign: 'right'}}>{st.percentage}%</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

const Fleet = () => {
	const {paramsObject: {tab = 'dashboard'}} = useSearchParams()

	const transports = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Davlat raqami', accessor: (r: Row) => r.plate_number},
		{Header: 'Ichki raqam', accessor: (r: Row) => r.identifier || '-'},
		{Header: 'Model', accessor: (r: Row) => [r.brand_name, r.model_name].filter(Boolean).join(' ') || '-'},
		{Header: 'Yili', accessor: (r: Row) => r.manufacturing_year || '-'},
		{Header: 'Yuk ko‘tarish (kg)', accessor: (r: Row) => money(r.carrying_capacity)},
		{Header: 'Yoqilg‘i', accessor: (r: Row) => r.fuel_type_display || '-'},
		{
			Header: 'Holati',
			accessor: (r: Row) => <Badge label={r.status_display} color={TRANSPORT_COLORS[r.status] ?? '#475569'}/>
		}
	], [])

	const drivers = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'F.I.Sh.', accessor: (r: Row) => r.employee_name || '-'},
		{Header: 'Telefon', accessor: (r: Row) => r.phone || '-'},
		{Header: 'Guvohnoma', accessor: (r: Row) => r.license_number || '-'},
		{Header: 'Toifa', accessor: (r: Row) => r.license_category_display || r.license_category || '-'},
		{Header: 'Amal qilish muddati', accessor: (r: Row) => date(r.license_expiry_date)}
	], [])

	const assignments = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Mashina', accessor: (r: Row) => r.transport?.plate_number ?? r.transport_plate_number ?? r.transport ?? '-'},
		{Header: 'Asosiy haydovchi', accessor: (r: Row) => r.primary_driver?.employee_name ?? r.primary_driver_name ?? r.primary_driver ?? '-'},
		{Header: 'Ikkinchi haydovchi', accessor: (r: Row) => r.secondary_driver?.employee_name ?? r.secondary_driver_name ?? '-'},
		{Header: 'Boshlanish', accessor: (r: Row) => date(r.start_date)},
		{Header: 'Tugash', accessor: (r: Row) => date(r.end_date)}
	], [])

	const factories = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Mijoz', accessor: (r: Row) => r.customer?.company_name ?? r.customer?.fullname ?? '-'},
		{Header: 'Zavod', accessor: (r: Row) => r.name || '-'},
		{Header: 'Manzil', accessor: (r: Row) => r.address || '-'},
		{Header: 'Masofa (km)', accessor: (r: Row) => r.distance_km ?? '-'},
		{Header: 'Yo‘l vaqti', accessor: (r: Row) => r.estimated_travel_time || '-'},
		{Header: 'Mas’ul', accessor: (r: Row) => [r.contact_person, r.phone].filter(Boolean).join(' · ') || '-'}
	], [])

	const fuel = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Sana', accessor: (r: Row) => dateTime(r.created_at)},
		{Header: 'Mashina', accessor: (r: Row) => r.transport_plate_number || '-'},
		{Header: 'Haydovchi', accessor: (r: Row) => r.driver_name || '-'},
		{Header: 'Litr', accessor: (r: Row) => r.liters},
		{Header: 'Summa', accessor: (r: Row) => money(r.amount)},
		{Header: 'Spidometr', accessor: (r: Row) => `${money(r.odometer_before)} → ${money(r.odometer_after)}`}
	], [])

	const maintenance = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Sana', accessor: (r: Row) => date(r.service_date)},
		{Header: 'Mashina', accessor: (r: Row) => r.transport?.plate_number ?? r.transport_plate_number ?? '-'},
		{Header: 'Xizmat turi', accessor: (r: Row) => r.service_type_display},
		{Header: 'Narxi', accessor: (r: Row) => money(r.cost)},
		{Header: 'Holati', accessor: (r: Row) => r.status_display}
	], [])

	const models = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Marka', accessor: (r: Row) => r.brand?.name ?? r.brand_name ?? '-'},
		{Header: 'Model', accessor: (r: Row) => r.name}
	], [])

	const brands = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Marka', accessor: (r: Row) => r.name}
	], [])

	return (
		<div style={PAGE_FONT}>
			<PageTitle title="Logistika"/>
			<Tab query="tab" fallbackValue="dashboard" tabs={TABS}/>
			<div style={{marginTop: '1.2rem'}}>
				{tab === 'dashboard' && <Dashboard/>}
				{tab === 'transports' && (
					<Crud
						endpoint="logistics/transports"
						addLabel="Mashina qo‘shish"
						columns={transports}
						toForm={(r) => ({...r, model: id(r.model)})}
						fields={[
							{name: 'plate_number', label: 'Davlat raqami', required: true, span: 4},
							{name: 'identifier', label: 'Ichki raqam', span: 4},
							{name: 'inventory_number', label: 'Inventar raqami', span: 4},
							{
								name: 'model', label: 'Model', type: 'select', required: true, span: 4,
								source: {endpoint: 'logistics/models/select', label: (r) => r.full_name || r.name}
							},
							{name: 'manufacturing_year', label: 'Ishlab chiqarilgan yili', type: 'number', span: 4},
							{name: 'status', label: 'Holati', type: 'select', options: TRANSPORT_STATUSES, required: true, span: 4},
							{name: 'carrying_capacity', label: 'Yuk ko‘tarish (kg)', type: 'number', span: 4},
							{name: 'volume', label: 'Kuzov hajmi (m³)', type: 'number', span: 4},
							{name: 'pallet_capacity', label: 'Poddon sig‘imi', type: 'number', span: 4},
							{name: 'fuel_type', label: 'Yoqilg‘i turi', type: 'select', options: FUEL_TYPES, span: 4},
							{name: 'fuel_tank_capacity', label: 'Bak hajmi (l)', type: 'number', span: 4},
							{name: 'average_fuel_consumption', label: 'O‘rtacha sarf (l/100 km)', type: 'number', span: 4},
							{name: 'vin_number', label: 'VIN', span: 6},
							{name: 'engine_number', label: 'Dvigatel raqami', span: 6}
						]}
					/>
				)}
				{tab === 'drivers' && (
					<Crud
						endpoint="logistics/drivers"
						addLabel="Haydovchi qo‘shish"
						columns={drivers}
						toForm={(r) => ({...r, employee: id(r.employee)})}
						fields={[
							{
								name: 'employee', label: 'Xodim', type: 'select', required: true, span: 6,
								source: {endpoint: 'accounts/employees/select', label: (r) => r.label}
							},
							{name: 'phone', label: 'Telefon', span: 6},
							{name: 'license_number', label: 'Guvohnoma raqami', required: true, span: 4},
							{name: 'license_category', label: 'Toifa', type: 'select', options: LICENSE_CATEGORIES, span: 4},
							{name: 'license_expiry_date', label: 'Amal qilish muddati', type: 'date', span: 4}
						]}
					/>
				)}
				{tab === 'assignments' && (
					<Crud
						endpoint="logistics/assignments"
						addLabel="Haydovchi biriktirish"
						columns={assignments}
						toForm={(r) => ({
							...r,
							transport: id(r.transport),
							primary_driver: id(r.primary_driver),
							secondary_driver: id(r.secondary_driver)
						})}
						fields={[
							{...transportPicker, span: 4},
							{...driverPicker('primary_driver', 'Asosiy haydovchi'), span: 4},
							{...driverPicker('secondary_driver', 'Ikkinchi haydovchi', false), span: 4},
							{name: 'start_date', label: 'Boshlanish sanasi', type: 'date', required: true, span: 4},
							{name: 'end_date', label: 'Tugash sanasi', type: 'date', span: 4},
							{name: 'comment', label: 'Izoh', span: 4}
						]}
					/>
				)}
				{tab === 'factories' && (
					<Crud
						endpoint="logistics/client-factories"
						addLabel="Mijoz zavodini qo‘shish"
						columns={factories}
						toForm={(r) => ({...r, customer: id(r.customer)})}
						fields={[
							{
								name: 'customer', label: 'Mijoz', type: 'select', required: true, span: 6,
								source: {endpoint: 'services/customers/select', label: (r) => r.label}
							},
							{name: 'name', label: 'Zavod / filial nomi', required: true, span: 6},
							{name: 'address', label: 'Manzil', required: true, span: 8},
							{name: 'distance_km', label: 'Masofa (km)', type: 'number', span: 4},
							{name: 'estimated_travel_time', label: 'Yetib borish vaqti', span: 4},
							{name: 'working_hours', label: 'Ish vaqti', span: 4},
							{name: 'google_maps_url', label: 'Google Maps havolasi', span: 4},
							{name: 'contact_person', label: 'Mas’ul shaxs', span: 4},
							{name: 'phone', label: 'Telefon', span: 4},
							{name: 'warehouse_contact', label: 'Ombor kontakti', span: 4}
						]}
					/>
				)}
				{tab === 'fuel' && (
					<Crud
						endpoint="logistics/fuel-records"
						addLabel="Yoqilg‘i yozuvi"
						columns={fuel}
						toForm={(r) => ({...r, transport: id(r.transport), driver: id(r.driver)})}
						fields={[
							{...transportPicker, span: 6},
							{...driverPicker('driver', 'Haydovchi', false), span: 6},
							{name: 'liters', label: 'Litr', type: 'number', required: true, span: 3},
							{name: 'amount', label: 'Summa (so‘m)', type: 'number', required: true, span: 3},
							{name: 'odometer_before', label: 'Spidometr (oldin)', type: 'number', span: 3},
							{name: 'odometer_after', label: 'Spidometr (keyin)', type: 'number', span: 3}
						]}
					/>
				)}
				{tab === 'maintenance' && (
					<Crud
						endpoint="logistics/maintenances"
						addLabel="Texnik xizmat"
						columns={maintenance}
						toForm={(r) => ({...r, transport: id(r.transport)})}
						fields={[
							{...transportPicker, span: 6},
							{name: 'service_type', label: 'Xizmat turi', type: 'select', options: MAINTENANCE_TYPES, required: true, span: 6},
							{name: 'service_date', label: 'Sana', type: 'date', required: true, span: 4},
							{name: 'cost', label: 'Narxi (so‘m)', type: 'number', span: 4},
							{name: 'status', label: 'Holati', type: 'select', options: MAINTENANCE_STATUSES, span: 4}
						]}
					/>
				)}
				{tab === 'brands' && (
					<Crud
						endpoint="logistics/brands"
						addLabel="Marka qo‘shish"
						columns={brands}
						fields={[{name: 'name', label: 'Marka nomi', required: true, span: 12}]}
					/>
				)}
				{tab === 'models' && (
					<Crud
						endpoint="logistics/models"
						addLabel="Model qo‘shish"
						columns={models}
						toForm={(r) => ({...r, brand: id(r.brand)})}
						fields={[
							{
								name: 'brand', label: 'Marka', type: 'select', required: true, span: 6,
								source: {endpoint: 'logistics/brands/select', label: (r) => r.name}
							},
							{name: 'name', label: 'Model nomi', required: true, span: 6}
						]}
					/>
				)}
			</div>
		</div>
	)
}

export default Fleet
