import {Button, Card, FileUpLoader, Form, Input, Modal, NumberFormattedInput, Select} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useAdd, useData, useSearchParams} from 'hooks'
import {useState} from 'react'
import {getSelectValue} from 'utilities/common'
import {showMessage} from 'utilities/alert'
import {Badge, dateTime, RETURN_COLORS, RETURN_REASONS, PAGE_FONT} from '../helpers'


type Row = Record<string, any>

const MODAL = 'shipment_return'

// Goods that came back from this shipment, and the form to record a new return
const ShipmentReturns = ({shipment, onChanged}: {shipment: Row, onChanged: () => void}) => {
	const {addParams, removeParams} = useSearchParams()
	const {data, refetch} = useData<Row>('logistics/returns', true, {shipment: shipment.id, page_size: 50})
	const {mutateAsync, isPending} = useAdd('logistics/returns', 'Qaytarish qayd etildi')
	const [form, setForm] = useState<Row>({})
	const [errors, setErrors] = useState<Row>({})

	const rows: Row[] = data?.results ?? []
	const sent = shipment.loaded_quantity ?? shipment.quantity
	const left = sent - rows.reduce((sum, r) => sum + r.quantity, 0)
	const canRecord = ['in_transit', 'delivered', 'returned'].includes(shipment.status) && left > 0

	const open = () => {
		setForm({quantity: String(left)})
		setErrors({})
		addParams({modal: MODAL})
	}

	const submit = () => {
		const quantity = Number(form.quantity)
		const next: Row = {}
		if (!quantity) next.quantity = 'Miqdorni kiriting'
		else if (quantity > left) next.quantity = `Ko‘pi bilan ${left} dona`
		if (!form.reason) next.reason = 'Sababni tanlang'
		setErrors(next)
		if (Object.keys(next).length) return
		mutateAsync({
			shipment: shipment.id,
			quantity,
			reason: form.reason,
			comment: form.comment || '',
			photo: form.photo?.id
		}).then(() => {
			removeParams('modal')
			refetch()
			onChanged()
		}).catch(() => showMessage('Saqlanmadi', 'error'))
	}

	if (!rows.length && !canRecord) return null

	return (
		<Card style={{padding: '1.5rem'}}>
			<div className="flex justify-between align-center" style={{marginBottom: '1rem'}}>
				<h3>Qaytgan tovarlar</h3>
				{canRecord && (
					<Button theme={BUTTON_THEME.DANGER_OUTLINE} onClick={open}>Qaytgan tovarni qayd etish</Button>
				)}
			</div>
			{rows.length === 0 ? (
				<div style={{...PAGE_FONT, color: '#64748b'}}>Bu jo‘natmadan hali hech narsa qaytmagan.</div>
			) : (
				<div className="flex flex-col gap-sm">
					{rows.map(r => (
						<div key={r.id} className="flex justify-between align-center gap-lg"
							style={{padding: '.8rem 0', borderBottom: '1px solid #f1f5f9'}}>
							<div className="flex flex-col" style={{gap: '.2rem'}}>
								<b>{r.quantity} dona · {r.reason_display}</b>
								<span style={{color: '#64748b', fontSize: '.8125rem'}}>
									{[dateTime(r.created_at), r.comment].filter(Boolean).join(' · ')}
								</span>
							</div>
							<div className="flex gap-sm align-center">
								{r.decision !== 'pending' && <Badge label={r.decision_display} color="#2563eb"/>}
								<Badge label={r.status_display} color={RETURN_COLORS[r.status] ?? '#475569'}/>
							</div>
						</div>
					))}
				</div>
			)}

			<Modal title="Qaytgan tovarni qayd etish" id={MODAL} onClose={() => removeParams('modal')} style={{width: '56rem', height: '44rem'}}>
				<Form className="flex flex-col gap-lg" onSubmit={(e) => {
					e.preventDefault()
					submit()
				}}>
					<div style={{...PAGE_FONT, color: '#64748b'}}>
						{shipment.shipment_number} · yuklangan {sent} dona, qaytishi mumkin {left} dona
					</div>
					<div className="grid gap-lg" style={{gridTemplateColumns: 'repeat(12, minmax(0, 1fr))'}}>
						<div className="span-4">
							<NumberFormattedInput id="return_quantity" label="Miqdor (dona)" value={form.quantity ?? ''}
								error={errors.quantity} onChange={(v: any) => setForm({...form, quantity: v})}/>
						</div>
						<div className="span-8">
							<Select id="return_reason" label="Sabab" options={RETURN_REASONS} error={errors.reason}
								value={getSelectValue(RETURN_REASONS, form.reason)}
								handleOnChange={(v) => setForm({...form, reason: v})}/>
						</div>
					</div>
					<Input id="return_comment" label="Izoh" value={form.comment ?? ''}
						onChange={(e) => setForm({...form, comment: e.target.value})}/>
					<FileUpLoader id="return_photo" url="attachments/create" type="image" label="Foto (shikast, qadoq)"
						value={form.photo ?? null} onChange={(v) => setForm(f => ({...f, photo: v}))}/>
					<div className="flex justify-end gap-lg">
						<Button type={FIELD.BUTTON} theme={BUTTON_THEME.OUTLINE} onClick={() => removeParams('modal')}>Bekor qilish</Button>
						<Button type={FIELD.SUBMIT} disabled={isPending}>Saqlash</Button>
					</div>
				</Form>
			</Modal>
		</Card>
	)
}

export default ShipmentReturns
