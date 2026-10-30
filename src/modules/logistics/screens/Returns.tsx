import {Button, Form, Input, Modal, Select, Tab} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useSearchParams} from 'hooks'
import interceptor from 'libraries/interceptor'
import {useCallback, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {showMessage} from 'utilities/alert'
import {getSelectValue} from 'utilities/common'
import Crud from '../components/Crud'
import {Badge, dateTime, index, RETURN_COLORS, RETURN_DECISIONS, RETURN_REASONS, PAGE_FONT} from '../helpers'


type Row = Record<string, any>

const DECISION_COLORS: Record<string, string> = {restock: '#16a34a', rework: '#2563eb', scrap: '#dc2626'}

// Returned goods: recorded from a shipment, then checked in the warehouse and decided on
const Returns = () => {
	const navigate = useNavigate()
	const {addParams, removeParams, paramsObject: {return_status = 'pending'}} = useSearchParams()
	const [inspecting, setInspecting] = useState<{row: Row, refetch: () => void} | null>(null)
	const [decision, setDecision] = useState<string | undefined>()
	const [note, setNote] = useState('')
	const [error, setError] = useState('')

	const openInspect = (row: Row, refetch: () => void) => {
		setInspecting({row, refetch})
		setDecision(undefined)
		setNote('')
		setError('')
		addParams({modal: 'inspect'})
	}

	const closeInspect = () => {
		setInspecting(null)
		removeParams('modal')
	}

	const submit = () => {
		if (!decision) return setError('Qarorni tanlang')
		if (!inspecting) return
		interceptor.post(`logistics/returns/${inspecting.row.id}/inspect`, {decision, note})
			.then(() => {
				showMessage('Qaror saqlandi', 'success')
				inspecting.refetch()
				closeInspect()
			})
	}

	const columns = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Sana', accessor: (r: Row) => dateTime(r.created_at)},
		{
			Header: 'Jo‘natma',
			accessor: (r: Row) => (
				<a style={{cursor: 'pointer', color: '#1d4ed8', whiteSpace: 'nowrap'}} onClick={() => navigate(`/shipments/${r.shipment}`)}>
					{r.shipment_number}
				</a>
			)
		},
		{Header: 'Mijoz', accessor: (r: Row) => r.customer_name || '-'},
		{Header: 'Mahsulot', accessor: (r: Row) => r.product_name || '-'},
		{Header: 'Miqdor', accessor: (r: Row) => <span style={{whiteSpace: 'nowrap'}}>{r.quantity} dona</span>},
		{
			Header: 'Sabab',
			accessor: (r: Row) => (
				<div className="flex flex-col" style={{gap: '.2rem'}}>
					<span>{r.reason_display}</span>
					{r.comment && <span style={{fontSize: '.85em', color: '#64748b'}}>{r.comment}</span>}
				</div>
			)
		},
		{Header: 'Foto', accessor: (r: Row) => r.photo?.file ? <a href={r.photo.file} target="_blank" rel="noreferrer">Ko‘rish</a> : '-'},
		{
			Header: 'Holati',
			accessor: (r: Row) => (
				<div className="flex flex-col" style={{gap: '.2rem'}}>
					<Badge label={r.status_display} color={RETURN_COLORS[r.status] ?? '#475569'}/>
					{r.decision !== 'pending' && <Badge label={r.decision_display} color={DECISION_COLORS[r.decision] ?? '#475569'}/>}
					{r.inspection_note && <span style={{fontSize: '.85em', color: '#64748b'}}>{r.inspection_note}</span>}
				</div>
			)
		}
	], [navigate])

	return (
		<>
			<Crud
				endpoint="logistics/returns"
				addLabel="Qaytarilgan tovar"
				hideAdd={true}
				columns={columns}
				params={{status: return_status === 'all' ? undefined : return_status}}
				toolbar={
					<Tab query="return_status" fallbackValue="pending" tabs={[
						{value: 'pending', label: 'Tekshirilmagan'},
						{value: 'inspected', label: 'Tekshirilgan'},
						{value: 'all', label: 'Barchasi'}
					]}/>
				}
				canModify={(r) => r.status === 'pending'}
				rowActions={(r, refetch) => r.status === 'pending'
					? <Button onClick={() => openInspect(r, refetch)}>Tekshirish</Button>
					: null}
				fields={[
					{name: 'quantity', label: 'Miqdor (dona)', type: 'number', required: true, span: 4},
					{name: 'reason', label: 'Sabab', type: 'select', options: RETURN_REASONS, required: true, span: 8},
					{name: 'comment', label: 'Izoh', span: 12},
					{name: 'photo', label: 'Foto', type: 'file', span: 12}
				]}
				toForm={(r) => ({...r})}
			/>
			<Modal title="Qaytgan tovarni tekshirish" id="inspect" onClose={closeInspect} style={{width: '52rem', height: '34rem'}}>
				<Form className="flex flex-col gap-lg" onSubmit={(e) => {
					e.preventDefault()
					submit()
				}}>
					<div style={{...PAGE_FONT, color: '#64748b'}}>
						{inspecting && `${inspecting.row.shipment_number} · ${inspecting.row.customer_name ?? ''} · ${inspecting.row.quantity} dona · ${inspecting.row.reason_display}`}
					</div>
					<Select
						id="decision"
						label="Qaror"
						options={RETURN_DECISIONS}
						error={error}
						value={getSelectValue(RETURN_DECISIONS, decision)}
						handleOnChange={(v) => {
							setDecision(v as string)
							setError('')
						}}
					/>
					<Input id="inspection_note" label="Izoh (ixtiyoriy)" value={note} onChange={(e) => setNote(e.target.value)}/>
					<div className="flex justify-end gap-lg">
						<Button type={FIELD.BUTTON} theme={BUTTON_THEME.OUTLINE} onClick={closeInspect}>Bekor qilish</Button>
						<Button type={FIELD.SUBMIT}>Saqlash</Button>
					</div>
				</Form>
			</Modal>
		</>
	)
}

export default Returns
