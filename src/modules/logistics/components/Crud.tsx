import {Plus} from 'assets/icons'
import {
	Button,
	Card,
	DatePicker,
	DeleteButton,
	DeleteModal,
	EditButton,
	FileUpLoader,
	Form,
	Input,
	Modal,
	NumberFormattedInput,
	Pagination,
	ReactTable,
	Select
} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useAdd, useData, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {ReactNode, useCallback, useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {Column} from 'react-table'
import {getSelectValue} from 'utilities/common'


type Row = Record<string, any>

export interface ICrudField {
	name: string
	label: string
	// file: uploaded to attachments, the record keeps the attachment id
	type?: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'file'
	required?: boolean
	options?: ISelectOption[]
	// select options loaded from an endpoint, mapped to {value, label}
	source?: {endpoint: string, label: (row: Row) => string}
	span?: number
}

interface IProperties {
	endpoint: string
	columns: (page: number, pageSize: number) => Column<Row>[]
	fields: ICrudField[]
	addLabel: string
	params?: Record<string, unknown>
	// detail row -> form values (ids for selects)
	toForm?: (row: Row) => Row
	toolbar?: ReactNode
	rowActions?: (row: Row, refetch: () => void) => ReactNode
	readOnly?: boolean
	// after anything here changes the list, e.g. to refresh totals shown elsewhere
	onChanged?: () => void
	// rows that may still be edited or deleted (e.g. a reviewed report is final)
	canModify?: (row: Row) => boolean
}

const MODAL = 'crud'
// 1fr columns grow to fit wide selects and push the form out of the modal
const FORM_GRID = {alignContent: 'start', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))'}
const FOOTER = {alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0'}

// The shared modal has a fixed 30rem height; size it to the form so nothing scrolls inside
const formHeight = (fields: ICrudField[]) => {
	let rows = 0
	let used = 12
	fields.forEach(f => {
		const span = f.span ?? 6
		if (used + span > 12) {
			rows += 1
			used = 0
		}
		used += span
	})
	return `${12 + rows * 8.5}rem`
}

const SourceSelect = ({field, value, onChange, error}: {
	field: ICrudField,
	value: unknown,
	onChange: (v: unknown) => void,
	error?: string
}) => {
	const {data = []} = useData<Row[]>(field.source?.endpoint ?? '', !!field.source)
	const options = useMemo<ISelectOption[]>(
		() => field.options ?? (data as Row[]).map(r => 'value' in r ? r as ISelectOption : {value: r.id, label: field.source!.label(r)}),
		[data, field]
	)
	return (
		<Select
			id={field.name}
			label={field.label}
			options={options}
			error={error}
			value={getSelectValue(options, value as string)}
			defaultValue={getSelectValue(options, value as string)}
			handleOnChange={(e) => onChange(e)}
		/>
	)
}

const Crud = ({endpoint, columns, fields, addLabel, params = {}, toForm, toolbar, rowActions, readOnly, onChanged, canModify}: IProperties) => {
	const {page, pageSize} = usePagination()
	const {addParams, removeParams, paramsObject: {updateId = undefined}} = useSearchParams()
	const empty = useMemo(() => Object.fromEntries(fields.map(f => [f.name, f.type === 'number' ? '' : undefined])), [fields])

	const {data, totalPages, isPending: isLoading, refetch: refetchList} = usePaginatedData<Row[]>(endpoint, {
		page,
		page_size: pageSize,
		...params
	})
	const refetch = useCallback(() => {
		onChanged?.()
		return refetchList()
	}, [onChanged, refetchList])
	const {mutateAsync: add, isPending: isAdding} = useAdd(endpoint)
	const {mutateAsync: update, isPending: isUpdating} = useUpdate(`${endpoint}/`, updateId, 'patch')
	const {data: detail} = useDetail<Row>(`${endpoint}/`, updateId, !!updateId)

	const {handleSubmit, control, reset, setError, formState: {errors}} = useForm<Row>({defaultValues: empty})
	const modalSize = useMemo(() => ({width: '64rem', height: formHeight(fields)}), [fields])

	useEffect(() => {
		if (updateId && detail) {
			const values = toForm ? toForm(detail) : detail
			reset(Object.fromEntries(fields.map(f => [f.name, values[f.name] ?? (f.type === 'number' ? '' : undefined)])))
		}
	}, [updateId, detail, fields, reset, toForm])

	const close = () => {
		reset(empty)
		removeParams('modal', 'updateId')
	}

	const onSubmit = (values: Row) => {
		let missing = false
		fields.forEach(f => {
			if (f.required && (values[f.name] === undefined || values[f.name] === null || values[f.name] === '')) {
				setError(f.name, {message: 'Majburiy maydon'})
				missing = true
			}
		})
		if (missing) return
		const payload = Object.fromEntries(Object.entries(values).filter(([key, v]) => {
			const field = fields.find(f => f.name === key)
			if (field?.type === 'file') return !!v
			return v !== undefined && v !== ''
		}).map(([key, v]) => {
			// the uploader keeps the stored attachment, the API takes its id
			const field = fields.find(f => f.name === key)
			return [key, field?.type === 'file' && typeof v === 'object' ? (v as Row).id : v]
		}))
		const request = updateId ? update(payload) : add(payload)
		request.then(async () => {
			close()
			await refetch()
		})
	}

	const tableColumns = useMemo<Column<Row>[]>(() => {
		const base = columns(page, pageSize)
		if (readOnly && !rowActions) return base
		return [...base, {
			Header: 'Amallar',
			accessor: (row: Row) => (
				<div className="flex align-center gap-lg">
					{rowActions?.(row, refetch)}
					{!readOnly && (canModify?.(row) ?? true) && <>
						<EditButton id={row.id}/>
						<DeleteButton id={row.id}/>
					</>}
				</div>
			)
		}]
	}, [columns, page, pageSize, readOnly, rowActions, refetch, canModify])

	const renderField = (f: ICrudField) => (
		<div key={f.name} className={`span-${f.span ?? 6}`}>
			<Controller
				name={f.name}
				control={control}
				render={({field: {value, onChange, onBlur, ref}}) => {
					const error = errors?.[f.name]?.message as string | undefined
					if (f.type === 'select') {
						return <SourceSelect field={f} value={value} onChange={onChange} error={error}/>
					}
					if (f.type === 'date' || f.type === 'datetime') {
						return (
							<DatePicker
								ref={ref}
								id={f.name}
								label={f.label}
								value={value ?? null}
								onBlur={onBlur}
								onChange={onChange}
								error={error}
								showTimeSelect={f.type === 'datetime'}
							/>
						)
					}
					if (f.type === 'number') {
						return (
							<NumberFormattedInput
								id={f.name}
								label={f.label}
								value={value ?? ''}
								onBlur={onBlur}
								onChange={onChange}
								error={error}
								allowDecimals={true}
							/>
						)
					}
					if (f.type === 'file') {
						return (
							<FileUpLoader
								id={f.name}
								ref={ref}
								url="attachments/create"
								type="image"
								label={f.label}
								value={value ?? null}
								onBlur={onBlur}
								onChange={onChange}
								error={error}
							/>
						)
					}
					return (
						<Input
							id={f.name}
							label={f.label}
							value={value ?? ''}
							onBlur={onBlur}
							onChange={onChange}
							error={error}
						/>
					)
				}}
			/>
		</div>
	)

	return (
		<>
			<Card>
				<div className="flex justify-between align-center gap-lg" style={{padding: '.8rem'}}>
					<div className="flex gap-lg align-center">{toolbar}</div>
					{!readOnly && (
						<Button icon={<Plus/>} onClick={() => {
							reset(empty)
							addParams({modal: MODAL}, 'updateId')
						}}>
							{addLabel}
						</Button>
					)}
				</div>
				<ReactTable columns={tableColumns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title={addLabel} id={MODAL} onClose={close} style={modalSize}>
				<Form className="grid gap-lg" style={FORM_GRID} onSubmit={handleSubmit(onSubmit)}>
					{fields.map(renderField)}
					<div className="span-12 flex justify-end gap-lg" style={FOOTER}>
						<Button type={FIELD.BUTTON} theme={BUTTON_THEME.OUTLINE} onClick={close}>Bekor qilish</Button>
						<Button type={FIELD.SUBMIT} disabled={isAdding}>Saqlash</Button>
					</div>
				</Form>
			</Modal>
			<Modal title="Tahrirlash" id="edit" onClose={close} style={modalSize}>
				<Form className="grid gap-lg" style={FORM_GRID} onSubmit={handleSubmit(onSubmit)}>
					{fields.map(renderField)}
					<div className="span-12 flex justify-end gap-lg" style={FOOTER}>
						<Button type={FIELD.BUTTON} theme={BUTTON_THEME.OUTLINE} onClick={close}>Bekor qilish</Button>
						<Button type={FIELD.SUBMIT} disabled={isUpdating}>Saqlash</Button>
					</div>
				</Form>
			</Modal>
			<DeleteModal endpoint={`${endpoint}/`} onDelete={() => refetch()}/>
		</>
	)
}

export default Crud
