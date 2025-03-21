import DetailButton from 'components/DetailButton'
import {ROLE_LIST} from 'constants/roles'
import {IWarehouseDetail as IReadyMadeWarehouseDetail, IWarehouseDetail} from 'interfaces/warehouse.interface'
import {Controller, useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useTranslation} from 'react-i18next'
import {semiFinishedWarehouseSchema} from 'helpers/yup'
import {useEffect, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
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
	useAdd, useAppContext,
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
	const {user} = useAppContext()
	const navigate = useNavigate()
	const {
		removeParams,
		paramsObject: {updateId = undefined}
	} = useSearchParams()

	const {
		data: dataList,
		totalPages,
		isPending: isLoading,
		refetch
	} = usePaginatedData<IWarehouseDetail[]>('accounts/warehouses/same-finished', {
		page,
		page_size: pageSize
	})
	// Updated defaultValues to remove "address"
	const {
		handleSubmit: handleAddSubmit,
		register: registerAdd,
		reset: resetAdd,
		control: controlAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: '', area: ''},
		resolver: yupResolver(semiFinishedWarehouseSchema)
	})

	// Removed "Address" column
	const columns: Column<IWarehouseDetail>[] = useMemo(
		() => [
			{
				Header: '№',
				accessor: (_: IWarehouseDetail, index: number) =>
					(page - 1) * pageSize + (index + 1),
				style: {width: '2.8rem', textAlign: 'center'}
			},
			{
				Header: t('Name'),
				accessor: (row: IWarehouseDetail) => row.name
			},
			{
				Header: `${t('Area')} (${t('m²')})`,
				accessor: (row: IReadyMadeWarehouseDetail) => decimalToInteger(row.area || '')
			},
			...(user?.role === ROLE_LIST.ADMIN ? [
					{
						Header: t('Actions'),
						accessor: (row: IWarehouseDetail) => (
							<div className="flex items-start gap-lg">
								<EditButton id={row.id}/>
								<DeleteButton id={row.id}/>
								<DetailButton onClick={() => navigate(`semi-finished-detail/${row.id}`)}/>
							</div>
						)
					}
				] : [{
					Header: t('Actions'),
					accessor: (row: IWarehouseDetail) => (
						<div className="flex items-start gap-lg">
							<DetailButton onClick={() => navigate(`semi-finished-detail/${row.id}`)}/>
						</div>
					)
				}]
			)
		],
		[page, pageSize]
	)

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		control: controlEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: '', area: ''},
		resolver: yupResolver(semiFinishedWarehouseSchema)
	})

	const {mutateAsync: addWarehouse, isPending: isAdding} = useAdd(
		'accounts/warehouses/same-finished'
	)
	const {mutateAsync: updateWarehouse, isPending: isUpdating} = useUpdate(
		'accounts/warehouses/same-finished/',
		updateId
	)
	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IWarehouseDetail>('accounts/warehouses/same-finished/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({
				name: detail.name || '',
				area: detail.area || ''
			})
		}
	}, [detail, resetEdit])

	return (
		<>
			<Card>
				<ReactTable columns={columns} data={dataList} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title="Add semi-finished warehouse" id="semiFinishedWarehouse" style={{height: '35rem'}}>
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

					<div className="span-4">
						<Controller
							control={controlAdd}
							name="area"
							render={({field}) => (
								<NumberFormattedInput
									id="area"
									maxLength={5}
									disableGroupSeparators={false}
									allowDecimals={false}
									label={`${t('Area')} (${t('m²')})`}
									error={addErrors?.area?.message}
									{...field}
								/>
							)}
						/>
					</div>

					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isAdding}>
						Save
					</Button>
				</Form>
			</Modal>

			<EditModal isLoading={isDetailLoading && !detail} style={{height: '35rem'}}>
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

					<div className="span-4">
						<Controller
							control={controlEdit}
							name="area"
							render={({field}) => (
								<NumberFormattedInput
									id="area"
									maxLength={5}
									disableGroupSeparators={false}
									allowDecimals={false}
									label={`${t('Area')} (${t('m²')})`}
									error={editErrors?.area?.message}
									{...field}
								/>
							)}
						/>
					</div>

					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isUpdating}>
						Edit
					</Button>
				</Form>
			</EditModal>

			<DeleteModal
				endpoint="accounts/warehouses/same-finished/"
				onDelete={async () => refetch()}
			/>
		</>
	)
}

export default Index
