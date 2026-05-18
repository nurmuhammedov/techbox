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
	DatePicker
} from 'components'
import { yupResolver } from '@hookform/resolvers/yup'
import { accidentSchema } from 'helpers/yup'
import { FIELD } from 'constants/fields'
import { useAdd, useData, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate } from 'hooks'
import { ISelectOption } from 'interfaces/form.interface'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Column } from 'react-table'
import { getSelectValue } from 'utilities/common'

const AccidentsTable = () => {
	const { t } = useTranslation()
	const { page, pageSize } = usePagination()
	const { addParams, removeParams, paramsObject: { updateId = undefined } } = useSearchParams()

	const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<any[]>(
		'hr/accidents',
		{
			page: page,
			page_size: pageSize
		}
	)

	const { data: employees = [] } = useData<ISelectOption[]>('accounts/employees/select')
	const { data: events = [] } = useData<ISelectOption[]>('hr/events-select')

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
			event: undefined,
			date: '',
			description: ''
		},
		resolver: yupResolver(accidentSchema)
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
			event: undefined,
			date: '',
			description: ''
		},
		resolver: yupResolver(accidentSchema)
	})

	const { mutateAsync: addAccident, isPending: isAdding } = useAdd('hr/accidents')
	const { mutateAsync: updateAccident, isPending: isUpdating } = useUpdate('hr/accidents/', updateId)
	const { data: detail, isPending: isDetailLoading } = useDetail<any>('hr/accidents/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({
				employee: detail.employee?.id?.toString() || detail.employee?.toString() || undefined,
				event: detail.event?.id?.toString() || detail.event?.toString() || undefined,
				date: detail.date ? detail.date.substring(0, 16) : '',
				description: detail.description || ''
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
				Header: t('event_type'),
				accessor: (row) => row.event ? row.event.name : '-'
			},
			{
				Header: t('Date'),
				accessor: (row) => row.date ? new Date(row.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
			},
			{
				Header: t('root_cause'),
				accessor: (row) => row.description
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
		addAccident(formData).then(async () => {
			resetAdd()
			removeParams('modal')
			await refetch()
		})
	}

	const onEditSubmit = (formData: any) => {
		updateAccident(formData).then(async () => {
			resetEdit()
			removeParams('modal', 'updateId')
			await refetch()
		})
	}

	return (
		<>
			<PageTitle title={t('Accidents')}>
				<Button icon={<Plus />} onClick={() => addParams({ modal: 'accident_modal' })}>
					{t('Add')}
				</Button>
			</PageTitle>

			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading} />
			</Card>
			<Pagination totalPages={totalPages} />

			{/* Add Modal */}
			<Modal title={t('add_accident')} id="accident_modal" style={{ height: '52rem', width: '50rem' }}>
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
						name="event"
						control={controlAdd}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<Select
								ref={ref}
								id="event"
								label={t('event_type')}
								onBlur={onBlur}
								error={addErrors.event?.message}
								options={events}
								value={getSelectValue(events, value)}
								defaultValue={getSelectValue(events, value)}
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
								showTimeSelect
							/>
						)}
					/>

					<Input
						id="description"
						label={t('root_cause')}
						error={addErrors.description?.message}
						{...registerAdd('description')}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isAdding}>
						{t('Save')}
					</Button>
				</Form>
			</Modal>

			{/* Edit Modal */}
			<EditModal title={t('edit_accident')} isLoading={isDetailLoading && !detail} style={{ height: '52rem', width: '50rem' }}>
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
						name="event"
						control={controlEdit}
						render={({ field: { value, ref, onChange, onBlur } }) => (
							<Select
								ref={ref}
								id="event"
								label={t('event_type')}
								onBlur={onBlur}
								error={editErrors.event?.message}
								options={events}
								value={getSelectValue(events, value)}
								defaultValue={getSelectValue(events, value)}
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
								showTimeSelect
							/>
						)}
					/>

					<Input
						id="description"
						label={t('came_late_reason')}
						error={editErrors.description?.message}
						{...registerEdit('description')}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isUpdating}>
						{t('Save')}
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="hr/accidents/" onDelete={() => refetch()} />
		</>
	)
}

export default AccidentsTable
