import {IWarehouseDetail as IReadyMadeWarehouseDetail} from 'interfaces/warehouse.interface'
import {semiFinishedWarehouseSchema as readyMadeWarehouseSchema} from 'helpers/yup'
import {Controller, useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useTranslation} from 'react-i18next'
import {useEffect, useMemo} from 'react'
import {FIELD} from 'constants/fields'
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
import {
	useAdd,
	useDetail,
	usePaginatedData,
	usePagination,
	useSearchParams,
	useUpdate
} from 'hooks'


const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {
		removeParams,
		paramsObject: {updateId = undefined}
	} = useSearchParams()

	const {
		data: dataList,
		totalPages,
		isPending: isLoading,
		refetch
	} = usePaginatedData<IReadyMadeWarehouseDetail[]>('accounts/warehouses/finished', {
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
		defaultValues: {name: '', area: ''},
		resolver: yupResolver(readyMadeWarehouseSchema)
	})

	const columns: Column<IReadyMadeWarehouseDetail>[] = useMemo(
		() => [
			{
				Header: '№',
				accessor: (_: IReadyMadeWarehouseDetail, index: number) =>
					(page - 1) * pageSize + (index + 1),
				style: {width: '2.8rem', textAlign: 'center'}
			},
			{
				Header: t('Name'),
				accessor: (row: IReadyMadeWarehouseDetail) => row.name
			},
			{
				Header: t('Area'),
				accessor: (row: IReadyMadeWarehouseDetail) => row.area
			},
			{
				Header: t('Actions'),
				accessor: (row: IReadyMadeWarehouseDetail) => (
					<div className="flex items-start gap-lg">
						<EditButton id={row.id}/>
						<DeleteButton id={row.id}/>
					</div>
				)
			}
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
		resolver: yupResolver(readyMadeWarehouseSchema)
	})

	const {mutateAsync: addWarehouse, isPending: isAdding} = useAdd(
		'accounts/warehouses/finished'
	)
	const {mutateAsync: updateWarehouse, isPending: isUpdating} = useUpdate(
		'accounts/warehouses/finished/',
		updateId
	)
	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IReadyMadeWarehouseDetail>('accounts/warehouses/finished/', updateId)

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

			<Modal
				title="Add ready-made warehouse"
				id="readyMadeWarehouse"
				style={{height: '35rem'}}
			>
				<Form
					onSubmit={handleAddSubmit(async (formData) => {
						await addWarehouse(formData)
						removeParams('modal')
						resetAdd()
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
									disableGroupSeparators
									allowDecimals={false}
									label="Area"
									error={addErrors?.area?.message}
									{...field}
								/>
							)}
						/>
					</div>

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
				style={{height: '40rem'}}
			>
				<Form
					onSubmit={handleEditSubmit(async (formData) => {
						await updateWarehouse(formData)
						removeParams('modal', 'updateId')
						resetEdit()
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
									disableGroupSeparators
									allowDecimals={false}
									label="Area"
									error={editErrors?.area?.message}
									{...field}
								/>
							)}
						/>
					</div>

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
				endpoint="accounts/warehouses/finished/"
				onDelete={async () => refetch()}
			/>
		</>
	)
}

export default Index