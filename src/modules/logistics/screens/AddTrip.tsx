import {Button, Card, DatePicker, Input, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useData} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import interceptor from 'libraries/interceptor'
import {useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {getSelectValue} from 'utilities/common'
import {showMessage} from 'utilities/alert'
import {driverLabel, money, PAGE_FONT, transportLabel} from '../helpers'


type Row = Record<string, any>

const OPEN_STATUSES = 'new,packed,loading_queue'
const ROW = {display: 'grid', gridTemplateColumns: '2.5rem minmax(0, 3fr) 11rem minmax(0, 2fr)', gap: '1rem', alignItems: 'center', padding: '.75rem 0', borderBottom: '1px solid #f1f5f9'}
const MUTED = {color: '#64748b', fontSize: '.8125rem'}

const options = (rows: Row[], label: (r: Row) => string): ISelectOption[] => rows.map(r => ({value: r.id, label: label(r)}))

const AddTrip = () => {
	const navigate = useNavigate()
	const {data: transports = []} = useData<Row[]>('logistics/transports/select')
	const {data: drivers = []} = useData<Row[]>('logistics/drivers/select')
	const {data: factories = []} = useData<Row[]>('logistics/client-factories/select')
	const {data: open, isPending} = useData<Row>('logistics/shipments', true, {status: OPEN_STATUSES, no_trip: 'true', page_size: 200})

	const [transport, setTransport] = useState<unknown>()
	const [driver, setDriver] = useState<unknown>()
	const [plannedDate, setPlannedDate] = useState<string | null>(new Date().toISOString().slice(0, 10))
	const [comment, setComment] = useState('')
	const [picked, setPicked] = useState<Record<number, Row>>({})
	const [busy, setBusy] = useState(false)

	const rows: Row[] = open?.results ?? []
	const readyTransports = useMemo(() => options((transports as Row[]).filter(t => t.status === 'available'), transportLabel), [transports])
	const driverOptions = useMemo(() => options(drivers as Row[], driverLabel), [drivers])
	const stops = Object.keys(picked).map(Number).filter(id => rows.some(r => r.id === id))
	const total = stops.reduce((sum, id) => sum + Number(picked[id].quantity || 0), 0)

	const toggle = (row: Row) => setPicked(current => {
		if (current[row.id]) {
			const {[row.id]: _, ...rest} = current
			return rest
		}
		return {...current, [row.id]: {quantity: String(row.quantity), client_factory: row.client_factory?.id}}
	})

	const change = (id: number, values: Row) => setPicked(current => ({...current, [id]: {...current[id], ...values}}))

	const submit = () => {
		if (!transport) return showMessage('Mashinani tanlang', 'error')
		if (!driver) return showMessage('Haydovchini tanlang', 'error')
		if (!plannedDate) return showMessage('Sanani tanlang', 'error')
		if (!stops.length) return showMessage('Kamida bitta jo‘natma tanlang', 'error')
		for (const id of stops) {
			const row = rows.find(r => r.id === id) as Row
			const quantity = Number(picked[id].quantity)
			if (!quantity || quantity > row.quantity) return showMessage(`${row.shipment_number}: ko‘pi bilan ${row.quantity} dona`, 'error')
		}
		setBusy(true)
		interceptor.post('logistics/trips', {
			transport,
			driver,
			planned_date: plannedDate,
			comment,
			stops: stops.map(id => ({
				shipment: id,
				quantity: Number(picked[id].quantity),
				client_factory: picked[id].client_factory || null
			}))
		})
			.then(({data}) => {
				showMessage('Reys yaratildi', 'success')
				navigate(`/shipments/trips/${data.id}`, {replace: true})
			})
			.finally(() => setBusy(false))
	}

	if (isPending) return <Loader/>

	return (
		<div className="flex flex-col flex-1 gap-lg" style={PAGE_FONT}>
			<PageTitle title="Yangi reys">
				<div className="flex gap-lg">
					<Button theme={BUTTON_THEME.OUTLINE} onClick={() => navigate(-1)}>Orqaga</Button>
					<Button type={FIELD.BUTTON} disabled={busy} onClick={submit}>Reysni yaratish</Button>
				</div>
			</PageTitle>

			<Card screen={false} style={{padding: '1.5rem'}}>
				<div className="grid gap-lg">
					<div className="span-3">
						<Select id="transport" label="Mashina *" options={readyTransports}
							value={getSelectValue(readyTransports, transport as string)}
							handleOnChange={(v) => setTransport(v)}/>
					</div>
					<div className="span-3">
						<Select id="driver" label="Haydovchi *" options={driverOptions}
							value={getSelectValue(driverOptions, driver as string)}
							handleOnChange={(v) => setDriver(v)}/>
					</div>
					<div className="span-3">
						<DatePicker id="planned_date" label="Sana *" value={plannedDate} onChange={setPlannedDate}/>
					</div>
					<div className="span-3">
						<Input id="trip_comment" label="Izoh" value={comment} onChange={(e) => setComment(e.target.value)}/>
					</div>
				</div>
			</Card>

			<Card screen={false} style={{padding: '1.5rem'}}>
				<div className="flex justify-between align-center gap-lg" style={{marginBottom: '.5rem'}}>
					<h3>Reysga jo‘natmalar qo‘shing</h3>
					<span style={MUTED}>{stops.length} ta manzil · {money(total)} dona</span>
				</div>
				{rows.length === 0 ? (
					<div style={{color: '#64748b'}}>Reysga qo‘shiladigan ochiq jo‘natma yo‘q.</div>
				) : rows.map(row => {
					const choice = picked[row.id]
					const own = (factories as Row[]).filter(f => f.customer === row.customer?.id)
					const factoryOptions = options(own, f => f.name)
					return (
						<div key={row.id} style={ROW}>
							<input
								type="checkbox"
								aria-label={`${row.shipment_number} jo‘natmasini tanlash`}
								style={{width: '1.25rem', height: '1.25rem'}}
								checked={!!choice}
								onChange={() => toggle(row)}
							/>
							<div className="flex flex-col" style={{gap: '.125rem', minWidth: 0}}>
								<b>{row.shipment_number}</b>
								<span style={MUTED}>
									{[row.customer?.company_name || row.customer?.fullname, row.sold_order?.order_name, `${money(row.quantity)} dona`].filter(Boolean).join(' · ')}
								</span>
							</div>
							{choice ? (
								<NumberFormattedInput
									id={`quantity_${row.id}`}
									value={choice.quantity}
									onChange={(v: any) => change(row.id, {quantity: v})}
								/>
							) : <span/>}
							{choice ? (
								<Select
									id={`factory_${row.id}`}
									options={factoryOptions}
									value={getSelectValue(factoryOptions, choice.client_factory)}
									handleOnChange={(v) => change(row.id, {client_factory: v})}
								/>
							) : <span style={MUTED}>{row.client_factory?.name || row.destination_address || ''}</span>}
						</div>
					)
				})}
			</Card>
		</div>
	)
}

export default AddTrip
