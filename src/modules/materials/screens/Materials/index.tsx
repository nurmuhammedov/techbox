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
	Form,
	NumberFormattedInput
} from 'components'
import {FIELD} from 'constants/fields'
import {materialSchema} from 'helpers/yup'
import {useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks'
import {IMaterialItemDetail} from 'interfaces/materials.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'
import {decimalToInteger} from 'utilities/common'


const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {removeParams, paramsObject: {updateId = undefined}} = useSearchParams()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IMaterialItemDetail[]>(
		'products/materials',
		{
			page: page,
			page_size: pageSize
		}
	)

	const {
		handleSubmit: handleAddSubmit,
		register: registerAdd,
		reset: resetAdd,
		control: controlAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: '', weight_1x1: ''},
		resolver: yupResolver(materialSchema)
	})

	const columns: Column<IMaterialItemDetail>[] = useMemo(() =>
			[
				{
					Header: t('№'),
					accessor: (_: IMaterialItemDetail, index: number) => ((page - 1) * pageSize) + (index + 1),
					style: {
						width: '3rem',
						textAlign: 'center'
					}
				},
				{
					Header: t('Name'),
					accessor: (row: IMaterialItemDetail) => row.name
				},
				{
					Header: `${t('Weight 1x1')} (${t('gr')})`,
					accessor: (row: IMaterialItemDetail) => decimalToInteger(row.weight_1x1 || '')
				},
				{
					Header: t('Actions'),
					accessor: (row: IMaterialItemDetail) => <div className="flex items-start gap-lg">
						<EditButton id={row.id}/>
						<DeleteButton id={row.id}/>
					</div>
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
		defaultValues: {name: '', weight_1x1: ''},
		resolver: yupResolver(materialSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('products/materials')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('products/materials/', updateId)
	const {data: detail, isPending: isDetailLoading} = useDetail<IMaterialItemDetail>('products/materials/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({name: detail.name, weight_1x1: detail.weight_1x1})
		}
	}, [detail, resetEdit])

	return (
		<>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title="Add material type" id="materialTypes" style={{height: '40rem'}}>
				<Form
					onSubmit={
						handleAddSubmit((data) => mutateAsync(data).then(async () => {
							resetAdd()
							removeParams('modal')
							await refetch()
						}))
					}
				>
					<Input
						id="name"
						type={FIELD.TEXT}
						label="Name"
						error={addErrors?.name?.message}
						{...registerAdd('name')}
					/>

					<Controller
						control={controlAdd}
						name="weight_1x1"
						render={({field}) => (
							<NumberFormattedInput
								id="weight_1x1"
								label={`${t('Weight 1x1')} (${t('gr')})`}
								disableGroupSeparators={false}
								maxLength={4}
								allowDecimals={false}
								error={addErrors?.weight_1x1?.message}
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

			<EditModal isLoading={isDetailLoading && !detail} style={{height: '40rem'}}>
				<Form
					onSubmit={
						handleEditSubmit((data) => update(data).then(async () => {
							resetEdit()
							removeParams('modal', 'updateId')
							await refetch()
						}))
					}
				>
					<Input
						id="name"
						type={FIELD.TEXT}
						label="Name"
						placeholder="Enter name"
						error={editErrors?.name?.message}
						{...registerEdit('name')}
					/>

					<Controller
						control={controlEdit}
						name="weight_1x1"
						render={({field}) => (
							<NumberFormattedInput
								id="weight_1x1"
								label={`${t('Weight 1x1')} (${t('gr')})`}
								disableGroupSeparators={false}
								maxLength={4}
								allowDecimals={false}
								error={editErrors?.weight_1x1?.message}
								{...field}
							/>
						)}
					/>

					<Button
						style={{marginTop: 'auto'}}
						type={FIELD.SUBMIT}
						disabled={isUpdating}
					>
						Save
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="products/materials/" onDelete={() => refetch()}/>
		</>
	)
}

export default Index
