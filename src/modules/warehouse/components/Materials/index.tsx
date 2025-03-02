import {yupResolver} from '@hookform/resolvers/yup'
import {warehouseSchema} from 'helpers/yup'
import {IWarehouseDetail} from 'interfaces/warehouse.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'
import {
	Card,
	Modal,
	EditModal,
	DeleteModal,
	Form,
	Input,
	NumberFormattedInput,
	Button,
	Pagination,
	ReactTable,
	EditButton,
	DeleteButton
} from 'components'
import {FIELD} from 'constants/fields'
import {
	useAdd,
	useDetail,
	usePaginatedData,
	usePagination,
	useSearchParams,
	useUpdate
} from 'hooks'
import {decimalToInteger} from 'utilities/common'


const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {removeParams, paramsObject: {updateId = undefined}} = useSearchParams()

	const {
		data: dataList,
		totalPages,
		isPending: isLoading,
		refetch
	} = usePaginatedData<IWarehouseDetail[]>('accounts/warehouses', {
		page,
		page_size: pageSize
	})

	const {
		handleSubmit: handleAddSubmit,
		register: registerAdd,
		reset: resetAdd,
		control: controlAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: '', address: '', area: ''},
		resolver: yupResolver(warehouseSchema)
	})

	const columns: Column<IWarehouseDetail>[] = useMemo(() => [
		{
			Header: '№',
			accessor: (_: IWarehouseDetail, index: number) => ((page - 1) * pageSize) + (index + 1),
			style: {width: '2.8rem', textAlign: 'center'}
		},
		{
			Header: t('Name'),
			accessor: (row: IWarehouseDetail) => row.name
		},
		{
			Header: t('Address'),
			accessor: (row: IWarehouseDetail) => row.address
		},
		{
			Header: `${t('Area')} (${t('m²')})`,
			accessor: (row: IWarehouseDetail) => decimalToInteger(row.area || '')
		},
		{
			Header: t('Actions'),
			accessor: (row: IWarehouseDetail) => (
				<div className="flex items-start gap-lg">
					<EditButton id={row.id}/>
					<DeleteButton id={row.id}/>
				</div>
			)
		}
	], [page, pageSize])

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		control: controlEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: '', address: '', area: ''},
		resolver: yupResolver(warehouseSchema)
	})

	const {mutateAsync: addWarehouse, isPending: isAdding} = useAdd('accounts/warehouses')
	const {mutateAsync: updateWarehouse, isPending: isUpdating} = useUpdate(
		'accounts/warehouses/',
		updateId
	)
	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IWarehouseDetail>('accounts/warehouses/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({
				name: detail.name,
				address: detail.address,
				area: detail.area
			})
		}
	}, [detail, resetEdit])

	return (
		<>
			<Card>
				<ReactTable
					columns={columns}
					data={dataList}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title="Add material warehouse" id="materialWarehouse" style={{height: '45rem'}}>
				<Form
					onSubmit={handleAddSubmit(async (formData) => {
						await addWarehouse(formData)
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

					<Input
						id="address"
						type={FIELD.TEXT}
						label="Address"
						error={addErrors?.address?.message}
						{...registerAdd('address')}
					/>

					<Controller
						control={controlAdd}
						name="area"
						render={({field}) => (
							<NumberFormattedInput
								id="area"
								maxLength={4}
								disableGroupSeparators={false}
								allowDecimals={false}
								label={`${t('Area')} (${t('m²')})`}
								error={addErrors?.area?.message}
								{...field}
							/>
						)}
					/>

					<Button
						style={{marginTop: 'auto'}}
						type={FIELD.SUBMIT}
						disabled={isAdding}
					>
						Save
					</Button>
				</Form>
			</Modal>

			<EditModal
				isLoading={isDetailLoading && !detail}
				style={{height: '45rem'}}
			>
				<Form
					onSubmit={handleEditSubmit(async (formData) => {
						await updateWarehouse(formData)
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

					<Input
						id="address"
						type={FIELD.TEXT}
						label="Address"
						error={editErrors?.address?.message}
						{...registerEdit('address')}
					/>

					<Controller
						control={controlEdit}
						name="area"
						render={({field}) => (
							<NumberFormattedInput
								id="area"
								maxLength={4}
								disableGroupSeparators={false}
								allowDecimals={false}
								label={`${t('Area')} (${t('m²')})`}
								error={editErrors?.area?.message}
								{...field}
							/>
						)}
					/>


					<Button
						style={{marginTop: 'auto'}}
						type={FIELD.SUBMIT}
						disabled={isUpdating}
					>
						Edit
					</Button>
				</Form>
			</EditModal>

			<DeleteModal
				endpoint="accounts/warehouses/"
				onDelete={async () => refetch()}
			/>
		</>
	)
}

export default Index