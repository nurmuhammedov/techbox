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
	DatePicker,
	MaskInput
} from 'components'
import { yupResolver } from '@hookform/resolvers/yup'
import { participationSchema } from 'helpers/yup'
import { FIELD } from 'constants/fields'
import { useAdd, useData, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate } from 'hooks'
import { ISelectOption } from 'interfaces/form.interface'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Column } from 'react-table'
import { getSelectValue } from 'utilities/common'

const ParticipationTable = () => {
	const { t } = useTranslation()
	const { page, pageSize } = usePagination()
	const { addParams, removeParams, paramsObject: { updateId = undefined } } = useSearchParams()

	const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<any[]>(
		'hr/participation',
		{
			page: page,
			page_size: pageSize
		}
	)

	const { data: employees = [] } = useData<ISelectOption[]>('accounts/employees/select')

	// const booleanOptions = [
	// 	{ value: 'true', label: t('Yes') },
	// 	{ value: 'false', label: t('No') }
	// ]

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
			date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
			arrival_time: '',
			time_leave: '',
			came_late: 'false',
			came_late_reason: ''
		},
		resolver: yupResolver(participationSchema)
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
			date: '',
			arrival_time: '',
			time_leave: '',
			came_late: 'false',
			came_late_reason: ''
		},
		resolver: yupResolver(participationSchema)
	})

	const { mutateAsync: addParticipation, isPending: isAdding } = useAdd('hr/participation')
	const { mutateAsync: updateParticipation, isPending: isUpdating } = useUpdate('hr/participation/', updateId)
	const { data: detail, isPending: isDetailLoading } = useDetail<any>('hr/participation/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({
				employee: detail.employee?.id?.toString() || detail.employee?.toString() || undefined,
				date: detail.date || '',
				arrival_time: detail.arrival_time ? detail.arrival_time.substring(0, 5) : '',
				time_leave: detail.time_leave ? detail.time_leave.substring(0, 5) : '',
				came_late: detail.came_late?.toString() || 'false',
				came_late_reason: detail.came_late_reason || ''
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
				accessor: (row) => row.employee ? `${row.employee.firstname} ${row.employee.lastname} ${row.employee.middle_name}` : '-'
			},
			{
				Header: t('Date'),
				accessor: (row) => row.date ? row.date.substring(0, 10).split('-').reverse().join('.') : '-'
			},
			{
				Header: t('arrival_time'),
				accessor: (row) => row.arrival_time ? row.arrival_time.substring(0, 5) : '-'
			},
			{
				Header: t('time_leave'),
				accessor: (row) => row.time_leave ? row.time_leave.substring(0, 5) : '-'
			},
			{
				Header: t('worked_hours'),
				accessor: (row) => row.worked_hours || '00:00'
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
		[t, page, pageSize]
	)

	const onAddSubmit = (formData: any) => {
		const payload = {
			...formData,
			came_late: formData.came_late === 'true'
		}
		addParticipation(payload).then(async () => {
			resetAdd()
			removeParams('modal')
			await refetch()
		})
	}

	const onEditSubmit = (formData: any) => {
		const payload = {
			...formData,
			came_late: formData.came_late === 'true'
		}
		updateParticipation(payload).then(async () => {
			resetEdit()
			removeParams('modal', 'updateId')
			await refetch()
		})
	}

	return (
		<>
			<PageTitle title={t('Participation')}>
				<Button icon={<Plus />} onClick={() => addParams({ modal: 'participation_modal' })}>
					{t('Add')}
				</Button>
			</PageTitle>

			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading} />
			</Card>
			<Pagination totalPages={totalPages} />

			{/* Add Modal */}
			<Modal title={t('add_participation')} id="participation_modal" style={{ height: '62rem', width: '50rem' }}>
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

					<Controller
						name="date"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<DatePicker
								ref={ref}
								id="date"
								label={t('Date')}
								onBlur={onBlur}
								error={addErrors.date?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="arrival_time"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<MaskInput
								ref={ref}
								id="arrival_time"
								label={t('arrival_time')}
								mask="99:99"
								placeholder="09:00"
								onBlur={onBlur}
								error={addErrors.arrival_time?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="time_leave"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<MaskInput
								ref={ref}
								id="time_leave"
								label={t('time_leave')}
								mask="99:99"
								placeholder="09:00"
								onBlur={onBlur}
								error={addErrors.time_leave?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="came_late"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<div className="flex items-center gap-md" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
								<input
									type="checkbox"
									id="came_late_add"
									ref={ref}
									checked={String(value) === 'true'}
									onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
									onBlur={onBlur}
									style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
								/>
								<label htmlFor="came_late_add" style={{ cursor: 'pointer', fontWeight: 500, fontFamily: 'Poppins, Arial, Helvetica, sans-serif', fontSize: '1rem', color: 'var(--black)' }}>{t('came_late')}</label>
							</div>
						)}
					/>

					<Input
						id="came_late_reason"
						label={t('came_late_reason')}
						error={addErrors.came_late_reason?.message}
						{...registerAdd('came_late_reason')}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isAdding}>
						{t('Save')}
					</Button>
				</Form>
			</Modal>

			{/* Edit Modal */}
			<EditModal title={t('edit_participation')} isLoading={isDetailLoading && !detail} style={{ height: '62rem', width: '50rem' }}>
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

					<Controller
						name="date"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<DatePicker
								ref={ref}
								id="date"
								label={t('Date')}
								onBlur={onBlur}
								error={editErrors.date?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="arrival_time"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<MaskInput
								ref={ref}
								id="arrival_time"
								label={t('arrival_time')}
								mask="99:99"
								placeholder="09:00"
								onBlur={onBlur}
								error={editErrors.arrival_time?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="time_leave"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<MaskInput
								ref={ref}
								id="time_leave"
								label={t('time_leave')}
								mask="99:99"
								placeholder="00:00"
								onBlur={onBlur}
								error={editErrors.time_leave?.message}
								value={value}
								onChange={onChange}
							/>
						)}
					/>

					<Controller
						name="came_late"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<div className="flex items-center gap-md" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
								<input
									type="checkbox"
									id="came_late_edit"
									ref={ref}
									checked={String(value) === 'true'}
									onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
									onBlur={onBlur}
									style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
								/>
								<label htmlFor="came_late_edit" style={{ cursor: 'pointer', fontWeight: 500, fontFamily: 'Poppins, Arial, Helvetica, sans-serif', fontSize: '1rem', color: 'var(--black)' }}>{t('came_late')}</label>
							</div>
						)}
					/>

					<Input
						id="came_late_reason"
						label={t('came_late_reason')}
						error={editErrors.came_late_reason?.message}
						{...registerEdit('came_late_reason')}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isUpdating}>
						{t('Save')}
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="hr/participation/" onDelete={() => refetch()} />
		</>
	)
}

export default ParticipationTable
