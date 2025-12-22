import {yupResolver} from '@hookform/resolvers/yup'
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
	Pagination,
	ReactTable,
	Select
} from 'components'
import {FIELD} from 'constants/fields'
import {roleOptions} from 'helpers/options'
import {rolesSchema} from 'helpers/yup'
import {useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks'
import {IRoleItemDetail} from 'interfaces/roles.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'
import {getSelectValue, joinArray} from 'utilities/common'


const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {removeParams, paramsObject: {updateId = undefined}} = useSearchParams()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<IRoleItemDetail[]>(
		'accounts/roles',
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
		defaultValues: {name: '', categories: undefined, comment: ''},
		resolver: yupResolver(rolesSchema)
	})

	const columns: Column<IRoleItemDetail>[] = useMemo(() =>
			[
				{
					Header: t('№'),
					accessor: (_: IRoleItemDetail, index: number) => ((page - 1) * pageSize) + (index + 1),
					style: {
						width: '3rem',
						textAlign: 'center'
					}
				},
				{
					Header: t('Name'),
					accessor: (row: IRoleItemDetail) => row.name
				},
				{
					Header: t('Allowed sections'),
					accessor: (row: IRoleItemDetail) => joinArray(row.categories, t)
				},
				{
					Header: t('Comment'),
					accessor: (row: IRoleItemDetail) => row.comment

				},
				{
					Header: t('Actions'),
					accessor: (row: IRoleItemDetail) => <div className="flex items-start gap-lg">
						<EditButton id={row.id}/>
						<DeleteButton id={row.id}/>
					</div>
				}
			],
		[t, page, pageSize]
	)

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		control: controlEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {name: '', categories: undefined, comment: ''},
		resolver: yupResolver(rolesSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('accounts/roles')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('accounts/roles/', updateId)
	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IRoleItemDetail>('accounts/roles/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({name: detail.name, categories: detail.categories, comment: detail.comment})
		}
	}, [detail, resetEdit])

	return (
		<>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title="Add role" id="role" style={{height: '45rem'}}>
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

					<Controller
						name="categories"
						control={controlAdd}
						render={({field: {value, ref, onChange, onBlur}}) => (
							<Select
								ref={ref}
								// top={true}
								id="categories"
								options={roleOptions}
								isMulti={true}
								onBlur={onBlur}
								label="Allowed sections"
								error={addErrors?.categories?.message}
								value={getSelectValue(roleOptions, value)}
								defaultValue={getSelectValue(roleOptions, value)}
								handleOnChange={(e) => onChange(e as string)}
							/>
						)}
					/>

					<Input
						id="comment"
						type={FIELD.TEXT}
						label="Comment"
						error={addErrors?.comment?.message}
						{...registerAdd('comment')}
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

			<EditModal isLoading={isDetailLoading && !detail} style={{height: '45rem'}}>
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
						name="categories"
						control={controlEdit}
						render={({field: {value, ref, onChange, onBlur}}) => (
							<Select
								ref={ref}
								// disabled={true}
								isMulti={true}
								// top={true}
								id="categories"
								options={roleOptions}
								onBlur={onBlur}
								label="Allowed sections"
								error={editErrors?.categories?.message}
								value={getSelectValue(roleOptions, value)}
								defaultValue={getSelectValue(roleOptions, value)}
								handleOnChange={(e) => onChange(e as string)}
							/>
						)}
					/>

					<Input
						id="comment"
						type={FIELD.TEXT}
						label="Comment"
						error={editErrors?.comment?.message}
						{...registerEdit('comment')}
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

			<DeleteModal endpoint="accounts/roles/" onDelete={() => refetch()}/>
		</>
	)
}

export default Index
