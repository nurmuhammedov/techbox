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
	ReactTable
} from 'components'
import { yupResolver } from '@hookform/resolvers/yup'
import { eventSchema } from 'helpers/yup'
import { FIELD } from 'constants/fields'
import { useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate } from 'hooks'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Column } from 'react-table'

const EventsTable = () => {
	const { t } = useTranslation()
	const { page, pageSize } = usePagination()
	const { addParams, removeParams, paramsObject: { updateId = undefined } } = useSearchParams()

	const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<any[]>(
		'hr/events',
		{
			page: page,
			page_size: pageSize
		}
	)

	const {
		handleSubmit: handleAddSubmit,
		register: registerAdd,
		reset: resetAdd,
		formState: { errors: addErrors }
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			name: ''
		},
		resolver: yupResolver(eventSchema)
	})

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		formState: { errors: editErrors }
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			name: ''
		},
		resolver: yupResolver(eventSchema)
	})

	const { mutateAsync: addEvent, isPending: isAdding } = useAdd('hr/events')
	const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdate('hr/events/', updateId)
	const { data: detail, isPending: isDetailLoading } = useDetail<any>('hr/events/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({
				name: detail.name || ''
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
				Header: t('Name'),
				accessor: (row) => row.name
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
		addEvent(formData).then(async () => {
			resetAdd()
			removeParams('modal')
			await refetch()
		})
	}

	const onEditSubmit = (formData: any) => {
		updateEvent(formData).then(async () => {
			resetEdit()
			removeParams('modal', 'updateId')
			await refetch()
		})
	}

	return (
		<>
			<PageTitle title={t('Events')}>
				<Button icon={<Plus />} onClick={() => addParams({ modal: 'event_modal' })}>
					{t('Add')}
				</Button>
			</PageTitle>

			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading} />
			</Card>
			<Pagination totalPages={totalPages} />

			{/* Add Modal */}
			<Modal title={t('add_event')} id="event_modal" style={{ height: '30rem', width: '50rem' }}>
				<Form onSubmit={handleAddSubmit(onAddSubmit)}>
					<Input
						id="name"
						label={t('Name')}
						error={addErrors.name?.message}
						{...registerAdd('name')}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isAdding}>
						{t('Save')}
					</Button>
				</Form>
			</Modal>

			{/* Edit Modal */}
			<EditModal title={t('edit_event')} isLoading={isDetailLoading && !detail} style={{ height: '30rem', width: '50rem' }}>
				<Form onSubmit={handleEditSubmit(onEditSubmit)}>
					<Input
						id="name"
						label={t('Name')}
						error={editErrors.name?.message}
						{...registerEdit('name')}
					/>

					<Button style={{ marginTop: 'auto' }} type={FIELD.SUBMIT} disabled={isUpdating}>
						{t('Save')}
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="hr/events/" onDelete={() => refetch()} />
		</>
	)
}

export default EventsTable
