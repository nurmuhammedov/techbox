import {Button, Card, DeleteButton, DeleteModal, Form, Modal, NumberFormattedInput, ReactTable, Select} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useAdd, useData, useSearchParams} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {useMemo, useState} from 'react'
import {createPortal} from 'react-dom'
import {Column} from 'react-table'
import {getSelectValue} from 'utilities/common'
import {dateTime, money, PACKABLE_STATUSES} from '../helpers'


type Row = Record<string, any>

const MODAL = 'packing'
const PRINT_ROOT = 'packing-print'
const PRINT_CSS = `.${PRINT_ROOT}{display:none}
@media print{body>*:not(.${PRINT_ROOT}){display:none!important}.${PRINT_ROOT}{display:block;padding:8mm;color:#000;font:11pt Arial,sans-serif}
.${PRINT_ROOT} table{width:100%;border-collapse:collapse;margin:6mm 0}.${PRINT_ROOT} th,.${PRINT_ROOT} td{border:1px solid #000;padding:2mm;text-align:left}}`

const PrintSheet = ({shipment, rows, boxes, weight}: {shipment: Row, rows: Row[], boxes: number, weight: number}) => createPortal(
	<div className={PRINT_ROOT}>
		<style>{PRINT_CSS}</style>
		<h2>Qadoqlash varaqasi (Packing list)</h2>
		<p>Jo‘natma: {shipment.shipment_number} · Mijoz: {shipment.customer?.company_name || shipment.customer?.fullname}</p>
		<p>Mahsulot: {shipment.sold_order?.order_name || '-'} · O‘lcham: {shipment.dimensions || '-'} · Manzil: {shipment.destination_address || '-'}</p>
		<table>
			<thead>
				<tr><th>№</th><th>Pallet</th><th>Shtrixkod</th><th>Quti soni</th><th>Vazni (kg)</th><th>Qadoqlovchi</th></tr>
			</thead>
			<tbody>
				{rows.map((r, i) => (
					<tr key={r.id}>
						<td>{i + 1}</td><td>{r.pallet_number}</td><td>{r.barcode}</td><td>{r.box_count}</td><td>{r.weight}</td><td>{r.packer?.fullname}</td>
					</tr>
				))}
				<tr><td colSpan={3}><b>Jami: {rows.length} pallet</b></td><td><b>{boxes}</b></td><td><b>{weight}</b></td><td/></tr>
			</tbody>
		</table>
		<p>Qadoqladi: ______________ &nbsp; Ombor: ______________ &nbsp; Haydovchi: ______________</p>
	</div>,
	document.body
)

// Pallets of this shipment: what was packed, how much is left, and the sheet that goes with the truck
const ShipmentPacking = ({shipment}: {shipment: Row}) => {
	const {addParams, removeParams} = useSearchParams()
	const {data, refetch} = useData<Row>('logistics/packagings', true, {shipment: shipment.id, page_size: 200})
	const {data: packers = []} = useData<ISelectOption[]>('logistics/packers/select')
	const {mutateAsync, isPending} = useAdd('logistics/packagings', 'Qadoq qo‘shildi')
	const [form, setForm] = useState<Row>({})
	const [errors, setErrors] = useState<Row>({})

	const rows: Row[] = useMemo(() => data?.results ?? [], [data])
	const boxes = rows.reduce((sum, r) => sum + r.box_count, 0)
	const weight = rows.reduce((sum, r) => sum + r.weight, 0)
	const left = shipment.quantity - boxes
	const editable = PACKABLE_STATUSES.includes(shipment.status)

	const columns = useMemo<Column<Row>[]>(() => [
		{Header: '№', accessor: (_: Row, i: number) => i + 1},
		{Header: 'Pallet', accessor: (r: Row) => <b>{r.pallet_number}</b>},
		{Header: 'Shtrixkod', accessor: (r: Row) => r.barcode},
		{Header: 'Quti soni', accessor: (r: Row) => money(r.box_count)},
		{Header: 'Vazni (kg)', accessor: (r: Row) => money(r.weight)},
		{Header: 'Qadoqlovchi', accessor: (r: Row) => r.packer?.fullname || '-'},
		{Header: 'Vaqti', accessor: (r: Row) => dateTime(r.packaging_time)},
		...(editable ? [{Header: 'Amallar', accessor: (r: Row) => <DeleteButton id={r.id}/>}] : [])
	], [editable])

	const open = () => {
		setForm({box_count: String(left)})
		setErrors({})
		addParams({modal: MODAL})
	}

	const submit = () => {
		const count = Number(form.box_count)
		const next: Row = {}
		if (!count) next.box_count = 'Quti sonini kiriting'
		else if (count > left) next.box_count = `Ko‘pi bilan ${left} dona`
		if (!Number(form.weight)) next.weight = 'Vaznni kiriting'
		if (!form.packer) next.packer = 'Qadoqlovchini tanlang'
		setErrors(next)
		if (Object.keys(next).length) return
		mutateAsync({shipment: shipment.id, box_count: count, weight: Number(form.weight), packer: form.packer})
			.then(() => {
				removeParams('modal')
				refetch()
			})
			.catch(() => undefined)
	}

	if (!rows.length && !editable) return null

	return (
		<Card screen={false} style={{padding: '1.5rem'}}>
			<div className="flex justify-between align-center gap-lg" style={{marginBottom: '1rem'}}>
				<div className="flex flex-col" style={{gap: '.25rem'}}>
					<h3>Packing list</h3>
					<span style={{color: '#64748b', fontSize: '.8125rem'}}>
						{money(boxes)} / {money(shipment.quantity)} dona qadoqlandi · {rows.length} pallet · {money(weight)} kg
					</span>
				</div>
				<div className="flex gap-lg">
					{rows.length > 0 && <Button theme={BUTTON_THEME.OUTLINE} onClick={() => window.print()}>Chop etish</Button>}
					{editable && left > 0 && <Button onClick={open}>Qadoq qo‘shish</Button>}
				</div>
			</div>
			<div style={{height: '.375rem', borderRadius: '.25rem', background: '#f1f5f9', marginBottom: '1rem'}}>
				<div style={{
					height: '100%',
					borderRadius: '.25rem',
					width: `${Math.min(100, boxes / shipment.quantity * 100)}%`,
					background: left === 0 ? '#16a34a' : '#146df3'
				}}/>
			</div>
			{rows.length > 0 && <ReactTable columns={columns} data={rows}/>}
			{rows.length > 0 && <PrintSheet shipment={shipment} rows={rows} boxes={boxes} weight={weight}/>}

			<Modal title="Qadoq qo‘shish" id={MODAL} onClose={() => removeParams('modal')} style={{width: '48rem', height: '24rem'}}>
				<Form className="flex flex-col gap-lg" onSubmit={(e) => {
					e.preventDefault()
					submit()
				}}>
					<div className="grid gap-lg" style={{gridTemplateColumns: 'repeat(12, minmax(0, 1fr))'}}>
						<div className="span-3">
							<NumberFormattedInput id="box_count" label="Quti soni" value={form.box_count ?? ''} error={errors.box_count}
								onChange={(v: any) => setForm({...form, box_count: v})}/>
						</div>
						<div className="span-3">
							<NumberFormattedInput id="weight" label="Vazni (kg)" allowDecimals={true} value={form.weight ?? ''} error={errors.weight}
								onChange={(v: any) => setForm({...form, weight: v})}/>
						</div>
						<div className="span-6">
							<Select id="packer" label="Qadoqlovchi" options={packers as ISelectOption[]} error={errors.packer}
								value={getSelectValue(packers as ISelectOption[], form.packer)}
								handleOnChange={(v) => setForm({...form, packer: v})}/>
						</div>
					</div>
					<div className="flex justify-end gap-lg">
						<Button type={FIELD.BUTTON} theme={BUTTON_THEME.OUTLINE} onClick={() => removeParams('modal')}>Bekor qilish</Button>
						<Button type={FIELD.SUBMIT} disabled={isPending}>Saqlash</Button>
					</div>
				</Form>
			</Modal>
			<DeleteModal endpoint="logistics/packagings/" onDelete={() => refetch()}/>
		</Card>
	)
}

export default ShipmentPacking
