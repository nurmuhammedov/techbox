import {Button, Form, Input, Modal, Tab} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {ROLE_LIST} from 'constants/roles'
import {useAppContext, useData, useSearchParams} from 'hooks'
import interceptor from 'libraries/interceptor'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback, useState} from 'react'
import {showMessage} from 'utilities/alert'
import Crud from '../components/Crud'
import {Badge, date, driverLabel, index, money, PAYMENT_METHODS, transportLabel, PAGE_BODY, PAGE_FONT} from '../helpers'


type Row = Record<string, any>

const STATUS_COLORS: Record<string, string> = {pending: '#b45309', approved: '#15803d', rejected: '#b91c1c'}
const id = (v: unknown) => (v && typeof v === 'object' ? (v as Row).id : v)

const Summary = () => {
	const {data} = useData<Row>('accounting/expense-reports/summary')
	if (!data) return null
	const card = (label: string, amount: number, count?: number, color = '#0f172a') => (
		<div className="span-3" style={{background: '#fff', borderRadius: '1rem', padding: '1.6rem'}}>
			<div style={{color: '#64748b', fontSize: '.875rem'}}>{label}</div>
			<div style={{fontSize: '1.625rem', fontWeight: 600, color, whiteSpace: 'nowrap'}}>{money(amount)} so‘m</div>
			{count !== undefined && <div style={{color: '#64748b', fontSize: '.8125rem'}}>{count} ta hisobot</div>}
		</div>
	)
	return (
		<div className="flex flex-col gap-lg" style={{marginBottom: '1.2rem'}}>
			{data.pending_review_needed && (
				<div style={{background: '#fef3c7', color: '#92400e', borderRadius: '1rem', padding: '1.2rem 1.6rem'}}>
					{data.pending?.count} ta hisobot rahbar tasdig‘ini kutmoqda
				</div>
			)}
			<div className="grid gap-lg">
				{card('Tasdiqlangan xarajat', data.approved?.amount ?? 0, data.approved?.count, '#15803d')}
				{card('Kutilmoqda', data.pending?.amount ?? 0, data.pending?.count, '#b45309')}
				{card('Rad etilgan', data.rejected?.amount ?? 0, data.rejected?.count, '#b91c1c')}
				{card('Jami hisobotlar', data.all_reports_amount ?? 0, data.total_reports_count)}
			</div>
			{Array.isArray(data.breakdown_by_type) && data.breakdown_by_type.length > 0 && (
				<div style={{background: '#fff', borderRadius: '1rem', padding: '1.6rem'}}>
					<div style={{fontWeight: 600, marginBottom: '1rem'}}>Xarajatlar tarkibi</div>
					<div className="flex flex-col gap-sm">
						{data.breakdown_by_type.map((t: Row) => (
							<div key={t.id} className="flex align-center gap-lg">
								<span style={{width: '16rem'}}>{t.name}</span>
								<div style={{flex: 1, background: '#f1f5f9', borderRadius: '.4rem', height: '.8rem'}}>
									<div style={{width: `${t.percentage}%`, background: '#2563eb', height: '100%', borderRadius: '.4rem'}}/>
								</div>
								<span style={{width: '18rem', textAlign: 'right'}}>{money(t.amount)} so‘m · {t.percentage}%</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

const Accounting = () => {
	const {user} = useAppContext()
	const {addParams, removeParams, paramsObject: {tab = 'reports', status = ''}} = useSearchParams()
	const queryClient = useQueryClient()
	const refreshSummary = useCallback(
		() => queryClient.invalidateQueries({queryKey: ['accounting/expense-reports/summary']}),
		[queryClient]
	)
	const canReview = user?.role === ROLE_LIST.ADMIN || (user?.categories ?? []).includes('leader')

	const [rejecting, setRejecting] = useState<{row: Row, refetch: () => void} | null>(null)
	const [reason, setReason] = useState('')
	const [reasonError, setReasonError] = useState('')

	const review = (row: Row, action: 'approve' | 'reject', refetch: () => void, comment = '') =>
		interceptor.post(`accounting/expense-reports/${row.id}/${action}`, {comment})
			.then(() => {
				showMessage(action === 'approve' ? 'Tasdiqlandi' : 'Rad etildi', 'success')
				refetch()
			})

	const openReject = (row: Row, refetch: () => void) => {
		setRejecting({row, refetch})
		setReason('')
		setReasonError('')
		addParams({modal: 'reject'})
	}

	const closeReject = () => {
		setRejecting(null)
		removeParams('modal')
	}

	const submitReject = () => {
		if (!reason.trim()) return setReasonError('Rad etish sababini yozing')
		if (!rejecting) return
		review(rejecting.row, 'reject', rejecting.refetch, reason.trim()).then(closeReject)
	}

	const reports = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Raqam', accessor: (r: Row) => <b style={{whiteSpace: 'nowrap'}}>{r.report_number}</b>},
		{Header: 'Sana', accessor: (r: Row) => date(r.date)},
		{Header: 'Xarajat turi', accessor: (r: Row) => r.expense_type_name},
		{Header: 'Mashina', accessor: (r: Row) => r.plate_number || '-'},
		{Header: 'Haydovchi', accessor: (r: Row) => r.driver_name || '-'},
		{Header: 'Summa', accessor: (r: Row) => <span style={{whiteSpace: 'nowrap'}}>{money(r.amount)} so‘m</span>},
		{Header: 'To‘lov', accessor: (r: Row) => r.payment_method_display},
		{Header: 'Chek', accessor: (r: Row) => {
			const url = r.receipt_image_url || r.receipt_file?.file || r.receipt_file?.url
			return url ? <a href={url} target="_blank" rel="noreferrer">Ko‘rish</a> : '-'
		}},
		{
			Header: 'Holati',
			accessor: (r: Row) => (
				<div className="flex flex-col" style={{gap: '.2rem'}}>
					<Badge label={r.status_display} color={STATUS_COLORS[r.status] ?? '#475569'}/>
					{r.manager_comment && <span style={{fontSize: '.85em', color: '#64748b'}}>{r.manager_comment}</span>}
				</div>
			)
		}
	], [])

	const types = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Nomi', accessor: (r: Row) => r.name},
		{Header: 'Izoh', accessor: (r: Row) => r.comment || '-'},
		{Header: 'Hisobotlar', accessor: (r: Row) => r.reports_count ?? 0},
		{Header: 'Sarflangan', accessor: (r: Row) => `${money(r.total_spent)} so‘m`},
		{Header: 'Holati', accessor: (r: Row) => r.is_active ? 'Faol' : 'Nofaol'}
	], [])

	return (
		<div className="flex flex-col flex-1" style={PAGE_BODY}>
				{tab === 'reports' && (
					<>
						<Summary/>
						<Crud
							endpoint="accounting/expense-reports"
							onChanged={refreshSummary}
							canModify={(r) => r.status === 'pending'}
							addLabel="Xarajat kiritish"
							columns={reports}
							params={{status: status || undefined}}
							toolbar={
								<Tab query="status" fallbackValue="" tabs={[
									{value: '', label: 'Barchasi'},
									{value: 'pending', label: 'Kutilmoqda'},
									{value: 'approved', label: 'Tasdiqlangan'},
									{value: 'rejected', label: 'Rad etilgan'}
								]}/>
							}
							toForm={(r) => ({
								...r,
								driver: id(r.driver),
								transport: id(r.transport),
								expense_type: id(r.expense_type),
							})}
							rowActions={(r, refetch) => canReview && r.status === 'pending' ? (
								<>
									<Button onClick={() => review(r, 'approve', refetch)}>Tasdiqlash</Button>
									<Button theme={BUTTON_THEME.DANGER_OUTLINE} onClick={() => openReject(r, refetch)}>Rad etish</Button>
								</>
							) : null}
							fields={[
								{
									name: 'expense_type', label: 'Xarajat turi', type: 'select', required: true, span: 4,
									source: {endpoint: 'accounting/expense-types/select', label: (r) => r.name}
								},
								{name: 'amount', label: 'Summa (so‘m)', type: 'number', required: true, span: 4},
								{name: 'date', label: 'Sana', type: 'date', required: true, span: 4},
								{
									name: 'driver', label: 'Haydovchi', type: 'select', required: true, span: 4,
									source: {endpoint: 'logistics/drivers/select', label: driverLabel}
								},
								{
									name: 'transport', label: 'Mashina (bo‘sh qolsa, haydovchining mashinasi)', type: 'select', span: 4,
									source: {endpoint: 'logistics/transports/select', label: transportLabel}
								},
								{name: 'payment_method', label: 'To‘lov turi', type: 'select', options: PAYMENT_METHODS, required: true, span: 4},
								{name: 'comment', label: 'Izoh', span: 6},
								{name: 'receipt_file', label: 'Chek rasmi', type: 'file', span: 6}
							]}
						/>
					</>
				)}
				{tab === 'types' && (
					<Crud
						endpoint="accounting/expense-types"
						addLabel="Xarajat turi qo‘shish"
						columns={types}
						fields={[
							{name: 'name', label: 'Nomi', required: true, span: 6},
							{name: 'comment', label: 'Izoh', span: 6}
						]}
					/>
				)}
			<Modal title="Hisobotni rad etish" id="reject" onClose={closeReject} style={{width: '48rem', height: '26rem'}}>
				<Form className="flex flex-col gap-lg" onSubmit={(e) => {
					e.preventDefault()
					submitReject()
				}}>
					<div style={{...PAGE_FONT, color: '#64748b'}}>
						{rejecting && `${rejecting.row.report_number} · ${rejecting.row.expense_type_name} · ${money(rejecting.row.amount)} so‘m`}
					</div>
					<Input
						id="reject_reason"
						label="Rad etish sababi"
						placeholder="Masalan: chek rasmi noaniq, qayta yuklang"
						value={reason}
						error={reasonError}
						onChange={(e) => {
							setReason(e.target.value)
							setReasonError('')
						}}
					/>
					<div className="flex justify-end gap-lg">
						<Button type={FIELD.BUTTON} theme={BUTTON_THEME.OUTLINE} onClick={closeReject}>Bekor qilish</Button>
						<Button type={FIELD.SUBMIT} theme={BUTTON_THEME.DANGER}>Rad etish</Button>
					</div>
				</Form>
			</Modal>
		</div>
	)
}

export default Accounting
