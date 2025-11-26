import {yupResolver} from '@hookform/resolvers/yup'
import {
	Button,
	Card,
	DeleteButton,
	DeleteModal,
	EditButton,
	EditModal,
	Input,
	Modal,
	Pagination,
	ReactTable,
	Form
} from 'components'
import {FIELD} from 'constants/fields'
import {useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks'
import {useEffect, useMemo} from 'react'
import {useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'
import * as yup from 'yup'


interface IGlueType {
	id: number
	name: string
}

const schema = yup.object().shape({
	name: yup.string().required('This field is required')
})

const GlueType = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {removeParams, paramsObject: {updateId = undefined}} = useSearchParams()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IGlueType[]>(
		'chemicals/glue-type',
		{page, page_size: pageSize}
	)

	const {
		handleSubmit: handleAddSubmit,
		register: registerAdd,
		reset: resetAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: ''},
		resolver: yupResolver(schema)
	})

	const columns: Column<IGlueType>[] = useMemo(() => [
		{
			Header: t('№'),
			accessor: (_: IGlueType, index: number) => ((page - 1) * pageSize) + (index + 1),
			style: {width: '3rem', textAlign: 'center'}
		},
		{Header: t('Name'), accessor: (row: IGlueType) => row.name},
		{
			Header: t('Actions'),
			accessor: (row: IGlueType) => (
				<div className="flex items-start gap-lg">
					<EditButton id={row.id}/>
					<DeleteButton id={row.id}/>
				</div>
			)
		}
	], [t, page, pageSize])

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: ''},
		resolver: yupResolver(schema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('chemicals/glue-type')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('chemicals/glue-type/', updateId)
	const {data: detail, isPending: isDetailLoading} = useDetail<IGlueType>('chemicals/glue-type/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({name: detail.name})
		}
	}, [detail, resetEdit])

	return (
		<>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			{/* Add Modal */}
			<Modal title="Add glue type" id="glue-type" style={{height: '25rem'}}>
				<Form onSubmit={handleAddSubmit((data) =>
					mutateAsync(data).then(async () => {
						resetAdd()
						removeParams('modal')
						await refetch()
					})
				)}>
					<Input
						id="name"
						type={FIELD.TEXT}
						label="Name"
						placeholder="Enter name"
						error={addErrors?.name?.message}
						{...registerAdd('name')}
					/>

					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isAdding}>
						Save
					</Button>
				</Form>
			</Modal>

			{/* Edit Modal */}
			<EditModal isLoading={isDetailLoading && !detail} style={{height: '25rem'}}>
				<Form onSubmit={handleEditSubmit((data) =>
					update(data).then(async () => {
						resetEdit()
						removeParams('modal', 'updateId')
						await refetch()
					})
				)}>
					<Input
						id="name"
						type={FIELD.TEXT}
						label="Name"
						placeholder="Enter name"
						error={editErrors?.name?.message}
						{...registerEdit('name')}
					/>

					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isUpdating}>
						Edit
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="chemicals/glue-type/" onDelete={() => refetch()}/>
		</>
	)
}

export default GlueType
