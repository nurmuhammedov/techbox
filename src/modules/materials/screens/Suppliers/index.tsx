import {yupResolver} from '@hookform/resolvers/yup'
import {
	Button,
	Card,
	DeleteButton,
	DeleteModal,
	EditButton,
	EditModal,
	Modal,
	Pagination,
	ReactTable,
	Form,
	Input
} from 'components'
import {FIELD} from 'constants/fields'
import {supplierSchema} from 'helpers/yup'
import {useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks'
import {useEffect, useMemo} from 'react'
import {useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'

const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {removeParams, paramsObject: {updateId = undefined}} = useSearchParams()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<{ name: string, id: number }[]>(
		'products/suppliers',
		{
			page,
			page_size: pageSize
		}
	)

	const {
		handleSubmit: handleAddSubmit,
		reset: resetAdd,
		register: registerAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: ''},
		resolver: yupResolver(supplierSchema)
	})

	const columns: Column<{ name: string, id: number }>[] = useMemo(() => [
		{
			Header: t('№'),
			accessor: (_: { name: string }, index: number) => ((page - 1) * pageSize) + (index + 1),
			style: {
				width: '3rem',
				textAlign: 'center'
			}
		},
		{
			Header: `${t('Name')}`,
			accessor: (row) => row?.name
		},
		{
			Header: t('Actions'),
			accessor: (row) => (
				<div className="flex items-start gap-lg">
					<EditButton id={row.id}/>
					<DeleteButton id={row.id}/>
				</div>
			)
		}
	], [page, pageSize, t])

	const {
		handleSubmit: handleEditSubmit,
		reset: resetEdit,
		register: registerEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: ''},
		resolver: yupResolver(supplierSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('products/suppliers')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('products/suppliers/', updateId)
	const {data: detail, isPending: isDetailLoading} = useDetail<{
		name: string,
		id: number
	}>('products/suppliers/', updateId)

	useEffect(() => {
		if (detail?.name) {
			resetEdit({name: detail.name})
		}
	}, [detail, resetEdit])

	return (
		<>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title="Add supplier" id="suppliers" style={{height: '25rem'}}>
				<Form
					onSubmit={handleAddSubmit(async (data) => {
						await mutateAsync(data)
						resetAdd()
						removeParams('modal')
						await refetch()
					})}
				>
					<Input
						id="name"
						type={FIELD.TEXT}
						label="Name"
						error={addErrors?.name?.message}
						{...registerAdd('name')}
					/>
					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isAdding}>
						Save
					</Button>
				</Form>
			</Modal>

			<EditModal isLoading={isDetailLoading} style={{height: '25rem'}}>
				<Form
					onSubmit={handleEditSubmit(async (data) => {
						await update(data)
						resetEdit()
						removeParams('modal', 'updateId')
						await refetch()
					})}
				>
					<Input
						id="name"
						type={FIELD.TEXT}
						label="Name"
						error={editErrors?.name?.message}
						{...registerEdit('name')}
					/>

					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isUpdating}>
						Edit
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="products/suppliers/" onDelete={() => refetch()}/>
		</>
	)
}

export default Index