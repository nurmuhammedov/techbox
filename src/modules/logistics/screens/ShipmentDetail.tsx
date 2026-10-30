import {Button, Card, Form, Input, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useAdd, useData, useDetail} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import interceptor from 'libraries/interceptor'
import {ReactNode, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {getSelectValue} from 'utilities/common'
import {showMessage} from 'utilities/alert'
import ShipmentReturns from '../components/ShipmentReturns'
import SignaturePad from '../components/SignaturePad'
import {dateTime, driverLabel, ShipmentBadge, transportLabel, PAGE_FONT} from '../helpers'


type Row = Record<string, any>

const STEPS = [
	{status: 'new', label: 'Yaratildi'},
	{status: 'packed', label: 'Tayyor'},
	{status: 'loading_queue', label: 'Yuklash navbatida'},
	{status: 'loaded', label: 'Yuklandi'},
	{status: 'in_transit', label: 'Yo‘lda'},
	{status: 'delivered', label: 'Yetkazildi'}
]

const Info = ({label, children}: {label: string, children: ReactNode}) => (
	<div className="flex flex-col" style={{gap: '.2rem'}}>
		<span style={{color: '#64748b', fontSize: '.8125rem'}}>{label}</span>
		<span style={{fontWeight: 500}}>{children || '-'}</span>
	</div>
)

const options = (rows: Row[] = [], label: (r: Row) => string): ISelectOption[] => rows.map(r => ({value: r.id, label: label(r)}))

const ShipmentDetail = () => {
	const {id} = useParams()
	const navigate = useNavigate()
	const {data: s, isPending, refetch} = useDetail<Row>('logistics/shipments/', id)
	const {data: transports = []} = useData<Row[]>('logistics/transports/select')
	const {data: drivers = []} = useData<Row[]>('logistics/drivers/select')
	const {mutateAsync: handover} = useAdd('logistics/handovers', 'Topshirildi')

	const [load, setLoad] = useState<Row>({})
	const [give, setGive] = useState<Row>({})
	const [receiver, setReceiver] = useState('')
	const [busy, setBusy] = useState(false)

	if (isPending || !s) return <Loader/>

	const setStatus = (status: string, extra: Row = {}) => {
		setBusy(true)
		return interceptor.patch(`logistics/shipments/${id}/status`, {status, ...extra})
			.then(() => {
				showMessage('Saqlandi', 'success')
				return refetch()
			})
			.finally(() => setBusy(false))
	}

	const transportOptions = options(transports as Row[], transportLabel)
	const driverOptions = options(drivers as Row[], driverLabel)
	const loadTransport = load.transport ?? s.transport?.id
	const loadDriver = load.driver ?? s.driver?.id
	const loadQuantity = load.loaded_quantity ?? String(s.quantity)
	const giveDriver = give.driver ?? s.driver?.id
	const giveCount = give.box_count ?? String(s.loaded_quantity ?? s.quantity)
	const reached = STEPS.findIndex(x => x.status === s.status)

	const finishLoading = () => {
		if (!loadTransport || !loadDriver) return showMessage('Mashina va haydovchini tanlang', 'error')
		const loaded = Number(loadQuantity)
		if (!loaded) return showMessage('Yuklangan miqdorni kiriting', 'error')
		if (loaded > s.quantity) return showMessage(`Rejadagi miqdor ${s.quantity} dona, undan ko‘p yuklab bo‘lmaydi`, 'error')
		setStatus('loaded', {transport: loadTransport, driver: loadDriver, loaded_quantity: loaded, loaded_by: load.loaded_by || ''})
	}

	const handOver = () => {
		if (!giveDriver) return showMessage('Haydovchini tanlang', 'error')
		if (!give.signature) return showMessage('Haydovchi imzosi kerak', 'error')
		setBusy(true)
		handover({
			driver: giveDriver,
			shipment: s.id,
			box_count: Number(giveCount),
			received_time: new Date().toISOString(),
			signature_image: give.signature,
			comment: give.comment || ''
		})
			.then(() => setStatus('in_transit'))
			.finally(() => setBusy(false))
	}

	return (
		<div style={PAGE_FONT}>
			<PageTitle title={`Jo‘natma ${s.shipment_number}`}>
				<div className="flex gap-lg align-center">
					<ShipmentBadge status={s.status}/>
					<Button theme={BUTTON_THEME.OUTLINE} onClick={() => navigate(-1)}>Orqaga</Button>
				</div>
			</PageTitle>

			<div className="flex flex-col gap-lg">
				<Card style={{padding: '1.5rem'}}>
					<div className="flex gap-lg" style={{flexWrap: 'wrap', alignItems: 'center'}}>
						{STEPS.map((step, i) => (
							<div key={step.status} className="flex align-center gap-sm" style={{
								color: i <= reached ? '#1d4ed8' : '#94a3b8',
								fontWeight: i === reached ? 600 : 400
							}}>
								<span>{i <= reached ? '●' : '○'}</span>
								<span>{step.label}</span>
								{i < STEPS.length - 1 && <span style={{color: '#cbd5e1'}}>—</span>}
							</div>
						))}
					</div>
				</Card>

				<div className="grid gap-lg">
					<Card className="span-6" style={{padding: '1.5rem'}}>
						<div className="grid gap-lg">
							<div className="span-6"><Info label="Mijoz">{s.customer?.company_name || s.customer?.fullname}</Info></div>
							<div className="span-6"><Info label="Mahsulot">{s.sold_order?.order_name}</Info></div>
							<div className="span-4"><Info label="Rejadagi miqdor">{`${s.quantity} dona`}</Info></div>
							<div className="span-4"><Info label="Yuklangan">{s.loaded_quantity != null ? `${s.loaded_quantity} dona` : ''}</Info></div>
							<div className="span-4"><Info label="Og‘irligi">{s.weight ? `${s.weight} kg` : ''}</Info></div>
							<div className="span-6"><Info label="O‘lcham">{s.dimensions}</Info></div>
							<div className="span-6"><Info label="Ombor">{s.warehouse?.name}</Info></div>
						</div>
					</Card>
					<Card className="span-6" style={{padding: '1.5rem'}}>
						<div className="grid gap-lg">
							<div className="span-6"><Info label="Mijoz zavodi">{s.client_factory?.name}</Info></div>
							<div className="span-6"><Info label="Telefon">{s.phone}</Info></div>
							<div className="span-12"><Info label="Manzil">{s.destination_address}</Info></div>
							<div className="span-6"><Info label="Reja">{[s.planned_date, s.planned_time?.slice(0, 5)].filter(Boolean).join(' ')}</Info></div>
							<div className="span-6"><Info label="Mashina / haydovchi">{[s.transport?.plate_number, s.driver?.employee_name ?? s.driver?.employee?.fullname].filter(Boolean).join(' · ')}</Info></div>
							<div className="span-6"><Info label="Yo‘lga chiqdi">{s.transit_started_at ? dateTime(s.transit_started_at) : ''}</Info></div>
							<div className="span-6"><Info label="Yetkazildi">{s.delivered_at ? `${dateTime(s.delivered_at)}${s.receiver_name ? ` · ${s.receiver_name}` : ''}` : ''}</Info></div>
						</div>
					</Card>
				</div>

				{(s.status === 'new' || s.status === 'packed') && (
					<Card style={{padding: '1.5rem'}}>
						<div className="flex gap-lg justify-end">
							<Button theme={BUTTON_THEME.DANGER_OUTLINE} disabled={busy} onClick={() => setStatus('cancelled')}>Bekor qilish</Button>
							{s.status === 'new' && <Button disabled={busy} onClick={() => setStatus('packed')}>Tayyor deb belgilash</Button>}
							{s.status === 'packed' && <Button disabled={busy} onClick={() => setStatus('loading_queue')}>Yuklash navbatiga qo‘yish</Button>}
						</div>
					</Card>
				)}

				{s.trip && (
					<Card style={{padding: '1rem 1.5rem'}}>
						Bu jo‘natma <Link to={`/shipments/trips/${s.trip}`}><b>{s.trip_number}</b></Link> reysida. Yuklash va topshirish reys sahifasida qilinadi.
					</Card>
				)}

				{s.status === 'loading_queue' && !s.trip && (
					<Card style={{padding: '1.5rem'}}>
						<h3 style={{marginBottom: '1.2rem'}}>Yuklash</h3>
						<Form className="grid gap-lg" onSubmit={e => e.preventDefault()}>
							<div className="span-3">
								<Select id="load_transport" label="Mashina" options={transportOptions}
									value={getSelectValue(transportOptions, loadTransport)}
									handleOnChange={(v) => setLoad({...load, transport: v})}/>
							</div>
							<div className="span-3">
								<Select id="load_driver" label="Haydovchi" options={driverOptions}
									value={getSelectValue(driverOptions, loadDriver)}
									handleOnChange={(v) => setLoad({...load, driver: v})}/>
							</div>
							<div className="span-3">
								<NumberFormattedInput id="loaded_quantity" label={`Yuklangan miqdor (rejada ${s.quantity})`}
									value={loadQuantity} onChange={(v: any) => setLoad({...load, loaded_quantity: v})}/>
							</div>
							<div className="span-3">
								<Input id="loaded_by" label="Yuklovchi F.I.Sh." value={load.loaded_by ?? ''}
									onChange={(e) => setLoad({...load, loaded_by: e.target.value})}/>
							</div>
							<div className="span-12 flex justify-end">
								<Button type={FIELD.BUTTON} disabled={busy} onClick={finishLoading}>Yuklashni yakunlash</Button>
							</div>
						</Form>
					</Card>
				)}

				{s.status === 'loaded' && !s.trip && (
					<Card style={{padding: '1.5rem'}}>
						<h3 style={{marginBottom: '1.2rem'}}>Haydovchiga topshirish</h3>
						<Form className="grid gap-lg" onSubmit={e => e.preventDefault()}>
							<div className="span-4">
								<Select id="give_driver" label="Haydovchi" options={driverOptions}
									value={getSelectValue(driverOptions, giveDriver)}
									handleOnChange={(v) => setGive({...give, driver: v})}/>
							</div>
							<div className="span-4">
								<NumberFormattedInput id="box_count" label="Qutilar soni" value={giveCount}
									onChange={(v: any) => setGive({...give, box_count: v})}/>
							</div>
							<div className="span-4">
								<Input id="give_comment" label="Izoh" value={give.comment ?? ''}
									onChange={(e) => setGive({...give, comment: e.target.value})}/>
							</div>
							<div className="span-12">
								<SignaturePad onChange={(signature) => setGive(g => ({...g, signature}))}/>
							</div>
							<div className="span-12 flex justify-end">
								<Button type={FIELD.BUTTON} disabled={busy} onClick={handOver}>Topshirish va yo‘lga chiqarish</Button>
							</div>
						</Form>
					</Card>
				)}

				{s.status === 'in_transit' && (
					<Card style={{padding: '1.5rem'}}>
						<h3 style={{marginBottom: '1.2rem'}}>Yetkazish natijasi</h3>
						<div className="grid gap-lg">
							<div className="span-6">
								<Input id="receiver_name" label="Qabul qiluvchi F.I.Sh." value={receiver}
									onChange={(e) => setReceiver(e.target.value)}/>
							</div>
							<div className="span-6 flex gap-lg justify-end" style={{alignItems: 'flex-end', alignSelf: 'end'}}>
								<Button theme={BUTTON_THEME.DANGER_OUTLINE} disabled={busy}
									onClick={() => setStatus('returned', {delivery_comment: receiver ? `Qaytardi: ${receiver}` : ''})}>
									Qaytarildi
								</Button>
								<Button disabled={busy} onClick={() => {
									if (!receiver) return showMessage('Qabul qiluvchini yozing', 'error')
									setStatus('delivered', {receiver_name: receiver})
								}}>
									Yetkazildi
								</Button>
							</div>
						</div>
					</Card>
				)}

				<ShipmentReturns shipment={s} onChanged={() => refetch()}/>
			</div>
		</div>
	)
}

export default ShipmentDetail
