import {Button, FileUpLoader, Input, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useDetail, useSearchParams} from 'hooks'
import interceptor from 'libraries/interceptor'
import {useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {showMessage} from 'utilities/alert'
import {getSelectValue} from 'utilities/common'
import SignaturePad from '../components/SignaturePad'
import {PAGE_BODY, RETURN_REASONS} from '../helpers'


type Row = Record<string, any>

const CARD = {padding: '1rem 1.25rem', background: '#fff', border: '1px solid var(--gray-pale)', borderRadius: '.75rem'}
const MUTED = {color: '#64748b', fontSize: '.875rem'}

// At the gate: hand the load over (part may be refused) or record that the customer refused it all
const DriverStop = () => {
	const {id, stopId} = useParams()
	const navigate = useNavigate()
	const {paramsObject: {action = 'deliver'}} = useSearchParams()
	const reject = action === 'reject'
	const {data: trip, isPending} = useDetail<Row>('logistics/driver/trips/', id)
	const [form, setForm] = useState<Row>({returned_quantity: ''})
	const [errors, setErrors] = useState<Row>({})
	const [busy, setBusy] = useState(false)

	if (isPending || !trip) return <Loader/>
	const stop: Row | undefined = (trip.stops ?? []).find((s: Row) => String(s.id) === stopId)
	if (!stop) return <Loader/>
	const sent = stop.loaded_quantity ?? stop.quantity
	const back = () => navigate(`/driver/trips/${id}`)

	if (stop.status !== 'in_transit') {
		return (
			<div className="flex flex-col gap-md" style={PAGE_BODY}>
				<PageTitle><Button theme={BUTTON_THEME.OUTLINE} onClick={back}>Orqaga</Button></PageTitle>
				<div style={CARD}>Bu manzil allaqachon yakunlangan.</div>
			</div>
		)
	}

	const set = (key: string, value: unknown) => {
		setForm(f => ({...f, [key]: value}))
		setErrors(e => ({...e, [key]: undefined}))
	}

	const submit = () => {
		const next: Row = {}
		const returned = Number(form.returned_quantity || 0)
		if (reject) {
			if (!form.return_reason) next.return_reason = 'Sababni tanlang'
		} else {
			if (!form.receiver_name?.trim()) next.receiver_name = 'Kim qabul qildi?'
			if (returned >= sent) next.returned_quantity = 'Hammasi qaytsa «Qabul qilmadi» ni tanlang'
			if (returned > 0 && !form.return_reason) next.return_reason = 'Qaytish sababini tanlang'
		}
		setErrors(next)
		if (Object.keys(next).length) return
		setBusy(true)
		const body = reject
			? {return_reason: form.return_reason, comment: form.comment || '', photo: form.photo?.id}
			: {
				receiver_name: form.receiver_name.trim(),
				client_signature: form.client_signature || undefined,
				comment: form.comment || '',
				returned_quantity: returned,
				return_reason: returned > 0 ? form.return_reason : undefined,
				photo: form.photo?.id
			}
		interceptor.post(`logistics/driver/stops/${stopId}/${reject ? 'reject' : 'deliver'}`, body)
			.then(() => {
				showMessage(reject ? 'Qaytarish qayd etildi' : 'Yetkazildi', 'success')
				back()
			})
			.finally(() => setBusy(false))
	}

	const returned = Number(form.returned_quantity || 0)
	return (
		<div className="flex flex-col gap-md" style={PAGE_BODY}>
			<PageTitle><Button theme={BUTTON_THEME.OUTLINE} onClick={back}>Orqaga</Button></PageTitle>

			<div className="flex flex-col gap-sm" style={CARD}>
				<b>{stop.factory_name || stop.customer_name}</b>
				<span>{stop.factory_address || stop.destination_address}</span>
				<span style={MUTED}>{[stop.customer_name, stop.order_name, `${sent} dona`].filter(Boolean).join(' · ')}</span>
			</div>

			<div className="flex flex-col gap-md" style={CARD}>
				<b>{reject ? 'Mijoz yukni qabul qilmadi' : 'Yukni topshirish'}</b>
				{reject && <span style={MUTED}>Hammasi ({sent} dona) omborga qaytadi va u yerda tekshiriladi.</span>}

				{!reject && (
					<Input id="receiver_name" label="Kim qabul qildi (F.I.Sh.)" value={form.receiver_name ?? ''}
						error={errors.receiver_name} onChange={(e) => set('receiver_name', e.target.value)}/>
				)}
				{!reject && (
					<NumberFormattedInput id="returned_quantity" label={`Qabul qilinmagan qismi (bo‘lsa), ${sent} donadan`}
						value={form.returned_quantity} error={errors.returned_quantity}
						onChange={(v: unknown) => set('returned_quantity', v)}/>
				)}
				{(reject || returned > 0) && (
					<Select id="return_reason" label={reject ? 'Sabab' : 'Qaytish sababi'} options={RETURN_REASONS}
						error={errors.return_reason} value={getSelectValue(RETURN_REASONS, form.return_reason)}
						handleOnChange={(v) => set('return_reason', v)}/>
				)}
				<Input id="comment" label="Izoh" value={form.comment ?? ''} onChange={(e) => set('comment', e.target.value)}/>
				<FileUpLoader id="photo" url="attachments/create" type="image" label="Foto (shikast, hujjat)"
					value={form.photo ?? null} onChange={(v) => set('photo', v)}/>
				{!reject && (
					<div className="flex flex-col gap-sm">
						<span style={MUTED}>Qabul qiluvchining imzosi</span>
						<SignaturePad hint="Qabul qiluvchi shu yerga imzo chekadi" onChange={(v) => set('client_signature', v)}/>
					</div>
				)}
				<Button type={FIELD.BUTTON} disabled={busy} theme={reject ? BUTTON_THEME.DANGER : BUTTON_THEME.PRIMARY} onClick={submit}>
					{reject ? 'Qaytarishni tasdiqlash' : 'Topshirildi'}
				</Button>
			</div>
		</div>
	)
}

export default DriverStop
