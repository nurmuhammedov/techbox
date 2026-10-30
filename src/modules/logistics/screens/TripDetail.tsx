import {Button, Card, Input, Loader, NumberFormattedInput, PageTitle} from 'components'
import {BUTTON_THEME} from 'constants/fields'
import {useDetail} from 'hooks'
import interceptor from 'libraries/interceptor'
import {useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {showMessage} from 'utilities/alert'
import SignaturePad from '../components/SignaturePad'
import {date, dateTime, money, PAGE_FONT, ShipmentBadge, TripBadge} from '../helpers'


type Row = Record<string, any>

const CARD = {padding: '1.5rem'}
const MUTED = {color: '#64748b', fontSize: '.8125rem'}
const STOP = {padding: '1rem 0', borderBottom: '1px solid #f1f5f9'}

const TripDetail = () => {
	const {id} = useParams()
	const navigate = useNavigate()
	const {data: trip, isPending, refetch} = useDetail<Row>('logistics/trips/', id)
	const [loaded, setLoaded] = useState<Row>({})
	const [loadedBy, setLoadedBy] = useState('')
	const [signature, setSignature] = useState<string | null>(null)
	const [receivers, setReceivers] = useState<Row>({})
	const [busy, setBusy] = useState(false)

	if (isPending || !trip) return <Loader/>

	const stops: Row[] = trip.stops
	const run = (request: Promise<unknown>, message: string) => {
		setBusy(true)
		return request
			.then(() => {
				showMessage(message, 'success')
				return refetch()
			})
			.finally(() => setBusy(false))
	}

	const finishLoading = () => {
		const items = stops.map(s => ({shipment: s.id, loaded_quantity: Number(loaded[s.id] ?? s.quantity)}))
		const wrong = items.find((item, i) => !item.loaded_quantity || item.loaded_quantity > stops[i].quantity)
		if (wrong) return showMessage('Yuklangan miqdorni tekshiring', 'error')
		run(interceptor.post(`logistics/trips/${id}/load`, {items, loaded_by: loadedBy}), 'Reys yuklandi')
	}

	const handOver = () => {
		if (!signature) return showMessage('Haydovchi imzosi kerak', 'error')
		run(interceptor.post(`logistics/trips/${id}/handover`, {signature_image: signature}), 'Reys yo‘lga chiqdi')
	}

	const setStopStatus = (stop: Row, status: string) => {
		const receiver = receivers[stop.id] ?? ''
		if (status === 'delivered' && !receiver) return showMessage('Qabul qiluvchini yozing', 'error')
		run(
			interceptor.patch(`logistics/shipments/${stop.id}/status`, status === 'delivered'
				? {status, receiver_name: receiver}
				: {status, delivery_comment: receiver ? `Qaytardi: ${receiver}` : ''}),
			'Saqlandi'
		)
	}

	const cancel = () => run(interceptor.post(`logistics/trips/${id}/cancel`), 'Reys bekor qilindi')

	return (
		<div className="flex flex-col gap-lg" style={PAGE_FONT}>
			<PageTitle title={`Reys ${trip.trip_number}`}>
				<div className="flex gap-lg align-center">
					<TripBadge status={trip.status}/>
					<Button theme={BUTTON_THEME.OUTLINE} onClick={() => navigate('/shipments?stage=trips')}>Orqaga</Button>
				</div>
			</PageTitle>

			<Card screen={false} style={CARD}>
				<div className="grid gap-lg">
					<div className="span-3"><div style={MUTED}>Mashina</div><b>{trip.plate_number || '-'}</b></div>
					<div className="span-3"><div style={MUTED}>Haydovchi</div><b>{trip.driver_name || '-'}</b></div>
					<div className="span-3"><div style={MUTED}>Sana</div><b>{date(trip.planned_date)}</b></div>
					<div className="span-3"><div style={MUTED}>Yuk</div><b>{trip.stops_count} ta manzil · {money(trip.total_quantity)} dona</b></div>
					{trip.comment && <div className="span-12"><div style={MUTED}>Izoh</div>{trip.comment}</div>}
				</div>
			</Card>

			<Card screen={false} style={CARD}>
				<h3 style={{marginBottom: '.5rem'}}>Manzillar</h3>
				{stops.map((stop, i) => (
					<div key={stop.id} style={STOP}>
						<div className="flex justify-between align-center gap-lg">
							<div className="flex flex-col" style={{gap: '.125rem', minWidth: 0}}>
								<b>{i + 1}. {stop.factory_name || stop.customer_name || '-'}</b>
								<span style={MUTED}>
									{[stop.customer_name, stop.destination_address, stop.phone].filter(Boolean).join(' · ')}
								</span>
								<span style={MUTED}>
									<Link to={`/shipments/${stop.id}`}>{stop.shipment_number}</Link>
									{[stop.order_name, stop.dimensions, `${money(stop.loaded_quantity ?? stop.quantity)} dona`].filter(Boolean).map(v => ` · ${v}`).join('')}
								</span>
								{stop.delivered_at && <span style={MUTED}>{dateTime(stop.delivered_at)} · {stop.receiver_name}</span>}
							</div>
							<ShipmentBadge status={stop.status}/>
						</div>

						{trip.status === 'planned' && (
							<div style={{maxWidth: '16rem', marginTop: '.75rem'}}>
								<NumberFormattedInput
									id={`loaded_${stop.id}`}
									label={`Yuklangan miqdor (rejada ${stop.quantity})`}
									value={loaded[stop.id] ?? String(stop.quantity)}
									onChange={(v: any) => setLoaded({...loaded, [stop.id]: v})}
								/>
							</div>
						)}

						{trip.status === 'in_transit' && stop.status === 'in_transit' && (
							<div className="flex gap-lg" style={{marginTop: '.75rem', alignItems: 'flex-end', flexWrap: 'wrap'}}>
								<div style={{flex: 1, minWidth: '14rem'}}>
									<Input id={`receiver_${stop.id}`} label="Qabul qiluvchi F.I.Sh." value={receivers[stop.id] ?? ''}
										onChange={(e) => setReceivers({...receivers, [stop.id]: e.target.value})}/>
								</div>
								<Button theme={BUTTON_THEME.DANGER_OUTLINE} disabled={busy} onClick={() => setStopStatus(stop, 'returned')}>Qaytarildi</Button>
								<Button disabled={busy} onClick={() => setStopStatus(stop, 'delivered')}>Yetkazildi</Button>
							</div>
						)}
					</div>
				))}
			</Card>

			{trip.status === 'planned' && (
				<Card screen={false} style={CARD}>
					<div className="flex gap-lg" style={{alignItems: 'flex-end', flexWrap: 'wrap'}}>
						<div style={{flex: 1, minWidth: '14rem'}}>
							<Input id="trip_loaded_by" label="Yuklovchi F.I.Sh." value={loadedBy} onChange={(e) => setLoadedBy(e.target.value)}/>
						</div>
						<Button theme={BUTTON_THEME.DANGER_OUTLINE} disabled={busy} onClick={cancel}>Reysni bekor qilish</Button>
						<Button disabled={busy} onClick={finishLoading}>Yuklashni yakunlash</Button>
					</div>
				</Card>
			)}

			{trip.status === 'loaded' && (
				<Card screen={false} style={CARD}>
					<h3 style={{marginBottom: '1rem'}}>Haydovchiga topshirish</h3>
					<SignaturePad onChange={setSignature}/>
					<div className="flex justify-end gap-lg" style={{marginTop: '1rem'}}>
						<Button theme={BUTTON_THEME.DANGER_OUTLINE} disabled={busy} onClick={cancel}>Reysni bekor qilish</Button>
						<Button disabled={busy} onClick={handOver}>Topshirish va yo‘lga chiqarish</Button>
					</div>
				</Card>
			)}
		</div>
	)
}

export default TripDetail
