import {Plus} from 'assets/icons'
import {Button, DatePicker, FileUpLoader, Input, Loader, NumberFormattedInput, PageTitle, Select} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useData, usePaginatedData} from 'hooks'
import interceptor from 'libraries/interceptor'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {showMessage} from 'utilities/alert'
import {getSelectValue} from 'utilities/common'
import DriverNav from '../components/DriverNav'
import {Badge, date, money, PAGE_BODY} from '../helpers'


type Row = Record<string, any>

const CARD = {padding: '1rem 1.25rem', background: '#fff', border: '1px solid var(--gray-pale)', borderRadius: '.75rem'}
const MUTED = {color: '#64748b', fontSize: '.875rem'}
const STATUS_COLORS: Record<string, string> = {pending: '#b45309', approved: '#15803d', rejected: '#b91c1c'}

// The driver's own expenses on the road, with the receipt and whether the leader approved it
export const DriverExpenses = () => {
	const navigate = useNavigate()
	const {data, isPending} = usePaginatedData<Row[]>('logistics/driver/expenses', {page: 1, page_size: 50})
	const rows: Row[] = (data as Row[]) ?? []
	const total = rows.filter(r => r.status !== 'rejected').reduce((sum, r) => sum + Number(r.amount), 0)

	return (
		<div className="flex flex-col gap-md" style={PAGE_BODY}>
			<PageTitle>
				<Button icon={<Plus/>} onClick={() => navigate('add')}>Xarajat qo‘shish</Button>
			</PageTitle>
			<div className="flex flex-col" style={CARD}>
				<span style={MUTED}>Jami xarajatlar</span>
				<b style={{fontSize: '1.5rem'}}>{money(total)} so‘m</b>
				<span style={MUTED}>{rows.length} ta hisobot</span>
			</div>
			{isPending ? <Loader/> : rows.length === 0 ? (
				<div style={{...CARD, textAlign: 'center', padding: '2rem 1rem'}}>
					<b>Hali xarajat kiritmagansiz</b>
					<div style={MUTED}>Yoqilg‘i, moy yoki yuvish uchun to‘laganingizni chek bilan kiriting.</div>
				</div>
			) : rows.map(r => (
				<div key={r.id} className="flex flex-col gap-sm" style={CARD}>
					<div className="flex justify-between align-center gap-md">
						<b>{r.expense_type_name}</b>
						<Badge label={r.status_display} color={STATUS_COLORS[r.status] ?? '#475569'}/>
					</div>
					<b style={{fontSize: '1.125rem'}}>{money(r.amount)} so‘m</b>
					<span style={MUTED}>{[date(r.date), r.plate_number, r.comment].filter(Boolean).join(' · ')}</span>
					{r.manager_comment && <span style={{...MUTED, color: '#b91c1c'}}>Rahbar: {r.manager_comment}</span>}
				</div>
			))}
			<DriverNav/>
		</div>
	)
}

export const DriverExpenseAdd = () => {
	const navigate = useNavigate()
	const {data: types = []} = useData<Row[]>('logistics/driver/expense-types')
	const options = (types as Row[]).map(t => ({value: t.id, label: t.name}))
	const [form, setForm] = useState<Row>({date: new Date().toISOString().slice(0, 10)})
	const [errors, setErrors] = useState<Row>({})
	const [busy, setBusy] = useState(false)

	const set = (key: string, value: unknown) => {
		setForm(f => ({...f, [key]: value}))
		setErrors(e => ({...e, [key]: undefined}))
	}

	const submit = () => {
		const next: Row = {}
		if (!form.expense_type) next.expense_type = 'Turini tanlang'
		if (!Number(form.amount)) next.amount = 'Summani kiriting'
		if (!form.receipt) next.receipt = 'Chek rasmini yuklang'
		setErrors(next)
		if (Object.keys(next).length) return
		setBusy(true)
		interceptor.post('logistics/driver/expenses', {
			expense_type: form.expense_type,
			amount: Number(form.amount),
			date: form.date,
			comment: form.comment || '',
			receipt_file: form.receipt?.id
		})
			.then(() => {
				showMessage('Xarajat yuborildi, rahbar tasdiqlaydi', 'success')
				navigate('/driver/expenses')
			})
			.finally(() => setBusy(false))
	}

	if (!types) return <Loader/>
	return (
		<div className="flex flex-col gap-md" style={PAGE_BODY}>
			<PageTitle><Button theme={BUTTON_THEME.OUTLINE} onClick={() => navigate('/driver/expenses')}>Orqaga</Button></PageTitle>
			<div className="flex flex-col gap-md" style={CARD}>
				<Select id="expense_type" label="Xarajat turi" options={options} error={errors.expense_type}
					value={getSelectValue(options, form.expense_type)} handleOnChange={(v) => set('expense_type', v)}/>
				<NumberFormattedInput id="amount" label="Summa (so‘m)" value={form.amount ?? ''} error={errors.amount}
					onChange={(v: unknown) => set('amount', v)}/>
				<DatePicker id="date" label="Sana" value={form.date} onChange={(v) => set('date', v)}/>
				<FileUpLoader id="receipt" url="attachments/create" type="image" label="Chek rasmi" error={errors.receipt}
					value={form.receipt ?? null} onChange={(v) => set('receipt', v)}/>
				<Input id="comment" label="Izoh (ixtiyoriy)" value={form.comment ?? ''} onChange={(e) => set('comment', e.target.value)}/>
				<Button type={FIELD.BUTTON} disabled={busy} onClick={submit}>Hisobotni yuborish</Button>
			</div>
			<DriverNav/>
		</div>
	)
}
