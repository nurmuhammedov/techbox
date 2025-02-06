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
	Form, NumberFormattedInput
} from 'components'
import {FIELD} from 'constants/fields'
import {positionsSchema} from 'helpers/yup'
import {useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks'
import {IPositionDetail} from 'interfaces/roles.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'


const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {removeParams, paramsObject: {updateId = undefined}} = useSearchParams()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IPositionDetail[]>(
		'accounts/positions',
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
		defaultValues: {name: '', experience: ''},
		resolver: yupResolver(positionsSchema)
	})

	const columns: Column<IPositionDetail>[] = useMemo(() =>
			[
				{
					Header: t('№'),
					accessor: (_: IPositionDetail, index: number) => ((page - 1) * pageSize) + (index + 1),
					style: {
						width: '2.8rem',
						textAlign: 'center'
					}
				},
				{
					Header: t('Name'),
					accessor: (row: IPositionDetail) => row.name
				},
				{
					Header: `${t('Experience')} (${t('year')})`,
					accessor: (row: IPositionDetail) => `${row.experience} ${t('year')}`

				},
				{
					Header: t('Actions'),
					accessor: (row: IPositionDetail) => <div className="flex items-start gap-lg">
						<EditButton id={row.id}/>
						<DeleteButton id={row.id}/>
					</div>
				}
			],
		[t, page, pageSize]
	)

	console.log(totalPages)
	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		control: controlEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: '', experience: ''},
		resolver: yupResolver(positionsSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('accounts/positions')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('accounts/positions/', updateId)
	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IPositionDetail>('accounts/positions/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({name: detail.name, experience: detail.experience})
		}
	}, [detail, resetEdit])

	return (
		<>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title="Add position" id="position" style={{height: '35rem'}}>
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
						placeholder="Enter name"
						error={addErrors?.name?.message}
						{...registerAdd('name')}
					/>

					{/*<Input*/}
					{/*	id="experience"*/}
					{/*	type={FIELD.TEXT}*/}
					{/*	label="Experience"*/}
					{/*	error={addErrors?.experience?.message}*/}
					{/*	{...registerAdd('experience')}*/}
					{/*/>*/}

					<div className="span-4">
						<Controller
							control={controlAdd}
							name="experience"
							render={({field}) => (
								<NumberFormattedInput
									id="experience"
									maxLength={2}
									disableGroupSeparators={true}
									allowDecimals={false}
									label={`${t('Experience')} (${t('year')})`}
									error={addErrors?.experience?.message}
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

			<EditModal isLoading={isDetailLoading && !detail} style={{height: '35rem'}}>
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

					{/*<Input*/}
					{/*	id="experience"*/}
					{/*	type={FIELD.TEXT}*/}
					{/*	label="Experience"*/}
					{/*	error={editErrors?.experience?.message}*/}
					{/*	{...registerEdit('experience')}*/}
					{/*/>*/}

					<div className="span-4">
						<Controller
							control={controlEdit}
							name="experience"
							render={({field}) => (
								<NumberFormattedInput
									id="experience"
									maxLength={2}
									disableGroupSeparators={true}
									allowDecimals={false}
									label={`${t('Experience')} (${t('year')})`}
									error={editErrors?.experience?.message}
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

			<DeleteModal endpoint="accounts/positions/" onDelete={() => refetch()}/>
		</>
	)
}

export default Index
