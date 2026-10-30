import {Card, Loader} from 'components'
import {useData} from 'hooks'
import {useNavigate} from 'react-router-dom'
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'
import {money, StatCard, STAT_GRID} from '../helpers'


type Row = Record<string, any>

const CARDS = [
	{key: 'planned_today', label: 'Bugungi reja', stage: 'planned'},
	{key: 'preparing', label: 'Tayyorlanmoqda', stage: 'planned'},
	{key: 'loading_queue', label: 'Yuklash navbatida', stage: 'loading'},
	{key: 'handover', label: 'Topshirishga tayyor', stage: 'handover'},
	{key: 'in_transit', label: 'Yo‘lda', stage: 'road'},
	{key: 'pending_returns', label: 'Tekshiruv kutmoqda', stage: 'returns'}
]

const WEEKDAYS = ['Yak', 'Du', 'Se', 'Cho', 'Pay', 'Ju', 'Sha']
const AXIS_TEXT = {fill: '#64748b', fontSize: 13}
const SECTION = {padding: '1.25rem'}

const dayLabel = (value: string) => {
	const day = new Date(value)
	return `${WEEKDAYS[day.getDay()]} ${String(day.getDate()).padStart(2, '0')}.${String(day.getMonth() + 1).padStart(2, '0')}`
}

const WarehouseDashboard = () => {
	const navigate = useNavigate()
	const {data, isPending} = useData<Row>('logistics/warehouse-dashboard')

	if (isPending || !data) return <Loader/>

	const week = (data.week as Row[]).map((d): Row => ({...d, label: dayLabel(d.date)}))
	const hasWeek = week.some(d => d.dispatched || d.delivered)
	const queue: Row[] = data.queue

	return (
		<div className="flex flex-col gap-lg flex-1">
			{data.overdue > 0 && (
				<div style={{padding: '.75rem 1rem', borderRadius: '.625rem', background: '#fef2f2', borderLeft: '4px solid #dc2626', color: '#991b1b'}}>
					{data.overdue} ta jo‘natma rejadagi sanadan kechikkan
				</div>
			)}
			<div style={STAT_GRID}>
				{CARDS.map(c => (
					<StatCard
						key={c.key}
						label={c.label}
						value={data[c.key]}
						onClick={() => navigate(`/shipments?stage=${c.stage}`)}
					/>
				))}
			</div>
			<div className="flex-1" style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(26rem, 1fr))'}}>
				<Card screen={false} style={SECTION}>
					<h3 style={{marginBottom: '1rem'}}>Oxirgi 7 kun</h3>
					{hasWeek ? (
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={week} barGap={2} barCategoryGap="30%" margin={{top: 4, right: 4, left: -20, bottom: 0}}>
								<CartesianGrid vertical={false} stroke="#eef2f6"/>
								<XAxis dataKey="label" tickLine={false} axisLine={{stroke: '#e2e8f0'}} tick={AXIS_TEXT}/>
								<YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS_TEXT}/>
								<Tooltip cursor={{fill: '#f1f5f9'}}/>
								<Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize: 13, color: '#475569'}}/>
								<Bar dataKey="dispatched" name="Jo‘natildi" fill="#146df3" radius={[4, 4, 0, 0]} maxBarSize={18}/>
								<Bar dataKey="delivered" name="Yetkazildi" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={18}/>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div style={{color: '#64748b'}}>Oxirgi 7 kunda jo‘natma chiqmagan.</div>
					)}
				</Card>
				<Card screen={false} style={SECTION}>
					<h3 style={{marginBottom: '.5rem'}}>Yuklash navbati</h3>
					{queue.length === 0 ? (
						<div style={{color: '#64748b'}}>Navbatda jo‘natma yo‘q.</div>
					) : queue.map(s => (
						<button
							key={s.id}
							type="button"
							onClick={() => navigate(`/shipments/${s.id}`)}
							className="flex justify-between align-center gap-lg"
							style={{width: '100%', padding: '.75rem 0', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'left', font: 'inherit'}}
						>
							<span className="flex flex-col" style={{gap: '.125rem', minWidth: 0}}>
								<b>{s.shipment_number}</b>
								<span style={{color: '#64748b', fontSize: '.8125rem'}}>
									{[s.customer_name, s.order_name, s.destination].filter(Boolean).join(' · ')}
								</span>
							</span>
							<span className="flex flex-col" style={{gap: '.125rem', textAlign: 'right', whiteSpace: 'nowrap'}}>
								<span>{money(s.quantity)} dona</span>
								<span style={{color: '#64748b', fontSize: '.8125rem'}}>
									{[s.planned_date, s.planned_time?.slice(0, 5)].filter(Boolean).join(' · ')}
								</span>
							</span>
						</button>
					))}
				</Card>
			</div>
		</div>
	)
}

export default WarehouseDashboard
