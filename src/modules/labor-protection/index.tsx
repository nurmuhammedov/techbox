import { Plus } from 'assets/icons'
import {
	Button,
	Card,
	DeleteButton,
	DeleteModal,
	EditButton,
	EditModal,
	Form,
	Input,
	Modal,
	PageTitle,
	Pagination,
	ReactTable,
	Select,
	FileUpLoader,
	DatePicker
} from 'components'
import { yupResolver } from '@hookform/resolvers/yup'
import { laborProtectionSchema } from 'helpers/yup'
import { FIELD } from 'constants/fields'
import { useAdd, useData, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate } from 'hooks'
import { ISelectOption } from 'interfaces/form.interface'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Column } from 'react-table'
import { getSelectValue } from 'utilities/common'

const LaborProtectionTable = () => {
	const { t } = useTranslation()
	const { page, pageSize } = usePagination()
	const { addParams, removeParams, paramsObject: { updateId = undefined } } = useSearchParams()

	const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<any[]>(
		'hr/labor-protection',
		{
			page: page,
			page_size: pageSize
		}
	)

	const { data: employees = [] } = useData<ISelectOption[]>('accounts/employees/select')

	const getEmployeeName = (emp: any) => {
		if (!emp) return '-'
		if (typeof emp === 'object') {
			return `${emp.firstname || ''} ${emp.lastname || ''} ${emp.middle_name || ''}`.trim() || `ID: ${emp.id}`
		}
		const found = employees.find(e => Number(e.value) === Number(emp))
		return found ? found.label : `ID: ${emp}`
	}

	const booleanOptions = [
		{ value: 'true', label: t('Yes') },
		{ value: 'false', label: t('No') }
	]

	const {
		handleSubmit: handleAddSubmit,
		register: registerAdd,
		reset: resetAdd,
		control: controlAdd,
		formState: { errors: addErrors }
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			employee: undefined,
			certificate_number: '',
			end_date: '',
			validity_period: '',
			is_daily: 'false',
			file: undefined
		},
		resolver: yupResolver(laborProtectionSchema)
	})

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		control: controlEdit,
		formState: { errors: editErrors }
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			employee: undefined,
			certificate_number: '',
			end_date: '',
			validity_period: '',
			is_daily: 'false',
			file: undefined
		},
		resolver: yupResolver(laborProtectionSchema)
	})

	const { mutateAsync: addProtection, isPending: isAdding } = useAdd('hr/labor-protection')
	const { mutateAsync: updateProtection, isPending: isUpdating } = useUpdate('hr/labor-protection/', updateId)
	const { data: detail, isPending: isDetailLoading } = useDetail<any>('hr/labor-protection/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({
				employee: detail.employee?.id?.toString() || detail.employee?.toString() || undefined,
				certificate_number: detail.certificate_number || '',
				end_date: detail.end_date || '',
				validity_period: detail.validity_period || '',
				is_daily: detail.is_daily?.toString() || 'false',
				file: detail.file
			})
		}
	}, [detail, resetEdit])

	const columns: Column<any>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Employee'),
				accessor: (row) => getEmployeeName(row.employee)
			},
			{
				Header: t('certificate_number'),
				accessor: (row) => row.certificate_number
			},
			{
				Header: t('end_date'),
				accessor: (row) => row.end_date ? row.end_date.split('-').reverse().join('.') : '-'
			},
			{
				Header: t('validity_period'),
				accessor: (row) => row.validity_period ? row.validity_period.split('-').reverse().join('.') : '-'
			},
			{
				Header: t('is_daily'),
				accessor: (row) => row.is_daily ? t('Yes') : t('No')
			},
			{
				Header: t('File'),
				accessor: (row) => row.file ? (
					<a
						href={row.file.file || row.file}
						target="_blank"
						rel="noreferrer"
						style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: '500' }}
					>
						{row.file.name || t('Download')}
					</a>
				) : '-'
			},
			{
				Header: t('Actions'),
				accessor: (row) => (
					<div className="flex items-start gap-lg">
						<EditButton id={row.id} />
						<DeleteButton id={row.id} />
					</div>
				)
			}
		],
		[t, page, pageSize, employees]
	)

	const onAddSubmit = (formData: any) => {
		const payload = {
			...formData,
			is_daily: formData.is_daily === 'true',
			file: formData.file?.id || formData.file || null
		}
		addProtection(payload).then(async () => {
			resetAdd()
			removeParams('modal')
			await refetch()
		})
	}

	const onEditSubmit = (formData: any) => {
		const payload = {
			...formData,
			is_daily: formData.is_daily === 'true',
			file: formData.file?.id || formData.file || null
		}
		updateProtection(payload).then(async () => {
			resetEdit()
			removeParams('modal', 'updateId')
			await refetch()
		})
	}

	return (
		<>
			<PageTitle title={t('labor_protection')}>
				<Button icon={<Plus />} onClick={() => addParams({ modal: 'labor_protection' })}>
					{t('Add')}
				</Button>
			</PageTitle>

			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading} />
			</Card>
			<Pagination totalPages={totalPages} />

			{/* Add Modal */}
			<Modal title={t('add_labor_protection')} id="labor_protection" style={{ height: '62rem', width: '50rem' }}>
				<Form onSubmit={handleAddSubmit(onAddSubmit)}>
					<Controller
						name="employee"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<Select
								ref={ref}
								id="employee"
								label={t('Employee')}
								onBlur={onBlur}
								error={addErrors.employee?.message}
								options={employees}
								value={getSelectValue(employees, value)}
								defaultValue={getSelectValue(employees, value)}
								handleOnChange={(e) => onChange(e as string)}
							/>
						)}
					/>

					<Input
						id="certificate_number"
						label={t('certificate_number')}
						error={addErrors.certificate_number?.message}
						{...registerAdd('certificate_number')}
					/>

					<Controller
						name="end_date"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<DatePicker
								ref={ref}
								id="end_date"
								label={t('end_date')}
								onBlur={onBlur}
								error={addErrors.end_date?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="validity_period"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<DatePicker
								ref={ref}
								id="validity_period"
								label={t('validity_period')}
								onBlur={onBlur}
								error={addErrors.validity_period?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="is_daily"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<Select
								ref={ref}
								id="is_daily"
								label={t('is_daily')}
								onBlur={onBlur}
								error={addErrors.is_daily?.message}
								options={booleanOptions}
								value={getSelectValue(booleanOptions, value)}
								defaultValue={getSelectValue(booleanOptions, value)}
								handleOnChange={(e) => onChange(e as string)}
							/>
						)}
					/>

					<Controller
						name="file"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<FileUpLoader
								id="file"
								ref={ref}
								url="attachments/create"
								value={value as any}
								onBlur={onBlur}
								onChange={onChange}
								label={t('File')}
								error={addErrors.file?.message}
							/>
						)}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isAdding}>
						{t('Save')}
					</Button>
				</Form>
			</Modal>

			{/* Edit Modal */}
			<EditModal title={t('edit_labor_protection')} isLoading={isDetailLoading && !detail} style={{ height: '62rem', width: '50rem' }}>
				<Form onSubmit={handleEditSubmit(onEditSubmit)}>
					<Controller
						name="employee"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<Select
								ref={ref}
								id="employee"
								label={t('Employee')}
								onBlur={onBlur}
								error={editErrors.employee?.message}
								options={employees}
								value={getSelectValue(employees, value)}
								defaultValue={getSelectValue(employees, value)}
								handleOnChange={(e) => onChange(e as string)}
							/>
						)}
					/>

					<Input
						id="certificate_number"
						label={t('certificate_number')}
						error={editErrors.certificate_number?.message}
						{...registerEdit('certificate_number')}
					/>

					<Controller
						name="end_date"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<DatePicker
								ref={ref}
								id="end_date"
								label={t('end_date')}
								onBlur={onBlur}
								error={editErrors.end_date?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="validity_period"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<DatePicker
								ref={ref}
								id="validity_period"
								label={t('validity_period')}
								onBlur={onBlur}
								error={editErrors.validity_period?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="is_daily"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<Select
								ref={ref}
								id="is_daily"
								label={t('is_daily')}
								onBlur={onBlur}
								error={editErrors.is_daily?.message}
								options={booleanOptions}
								value={getSelectValue(booleanOptions, value)}
								defaultValue={getSelectValue(booleanOptions, value)}
								handleOnChange={(e) => onChange(e as string)}
							/>
						)}
					/>

					<Controller
						name="file"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<FileUpLoader
								id="file"
								ref={ref}
								url="attachments/create"
								value={value as any}
								onBlur={onBlur}
								onChange={onChange}
								label={t('File')}
								error={editErrors.file?.message}
							/>
						)}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isUpdating}>
						{t('Save')}
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="hr/labor-protection/" onDelete={() => refetch()} />
		</>
	)
}

export default LaborProtectionTable
