import {yupResolver} from '@hookform/resolvers/yup'
import {Plus} from 'assets/icons'
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
	Select
} from 'components'
import {FIELD} from 'constants/fields'
import {ROLE_LIST} from 'constants/roles'
import {userSchema, userUpdateSchema} from 'helpers/yup'
import {
	useAdd,
	useAppContext,
	useData,
	useDetail,
	usePaginatedData,
	usePagination,
	useSearchParams,
	useUpdate
} from 'hooks'
import {IEmployeesItemDetail, IUserItemDetail} from 'interfaces/employees.interface'
import {ISelectOption} from 'interfaces/form.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {getSelectValue, joinArray} from 'utilities/common'


const Index = () => {
	const navigate = useNavigate()
	const {user} = useAppContext()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {addParams, removeParams, paramsObject: {updateId = undefined, modal = undefined}} = useSearchParams()
	const {data: roles = []} = useData<ISelectOption[]>('accounts/roles/select', (modal === 'permission' || modal === 'edit') && user?.role === ROLE_LIST.ADMIN)
	const {data: employees = []} = useData<ISelectOption[]>('accounts/employees/select', (modal === 'permission' || modal === 'edit') && user?.role === ROLE_LIST.ADMIN)

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IEmployeesItemDetail[]>(
		'accounts/employees',
		{
			page: page,
			page_size: pageSize
		},
		user?.role === ROLE_LIST.HEAD_DEPARTMENT
	)

	const {
		data: adminData,
		totalPages: adminTotalPages,
		isPending: isAdminDataLoading,
		refetch
	} = usePaginatedData<IUserItemDetail[]>(
		'accounts/',
		{
			page: page,
			page_size: pageSize
		},
		user?.role === ROLE_LIST.ADMIN
	)

	const {
		handleSubmit: handleAddSubmit,
		register: registerAdd,
		reset: resetAdd,
		control: controlAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			username: '',
			employee: undefined,
			password: '',
			password_confirm: '',
			role: undefined
		},
		resolver: yupResolver(userSchema)
	})

	const {
		handleSubmit: handleEditSubmit,
		register: registerEdit,
		reset: resetEdit,
		control: controlEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			username: '',
			// employee: undefined,
			role: undefined
		},
		resolver: yupResolver(userUpdateSchema)
	})


	const columns: Column<IEmployeesItemDetail>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IEmployeesItemDetail, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Full name'),
				accessor: (row: IEmployeesItemDetail) => `${row.firstname} ${row.lastname} ${row.middle_name} `
			},
			{
				Header: t('Address'),
				accessor: (row: IEmployeesItemDetail) => row.address
			},
			{
				Header: t('Position'),
				accessor: (row: IEmployeesItemDetail) => row.position?.name
			},
			{
				Header: t('Passport'),
				accessor: (row: IEmployeesItemDetail) => row.passport
			},
			{
				Header: t('Phone number'),
				accessor: (row: IEmployeesItemDetail) => row.phone
			},
			{
				Header: t('Actions'),
				accessor: (row: IEmployeesItemDetail) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
					</div>
				)
			}
		],
		[t, page, pageSize]
	)


	const adminColumns: Column<IUserItemDetail>[] = useMemo(
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
				Header: t('Full name'),
				accessor: (row) => row.fullname
			},
			{
				Header: t('Login'),
				accessor: (row) => row.username
			},
			{
				Header: t('Position'),
				accessor: (row) => row.position?.name
			},
			{
				Header: t('Role'),
				accessor: (row) => row.role?.name
			},
			{
				Header: t('Allowed sections'),
				accessor: (row) => joinArray(row.role?.categories ?? [], t)
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
		],
		[t, page, pageSize]
	)


	const {mutateAsync, isPending: isAdding} = useAdd('accounts/')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('accounts/', updateId)
	const {data: detail, isPending: isDetailLoading} = useDetail<IUserItemDetail>('accounts/', updateId)

	useEffect(() => {
		if (detail) {
			resetEdit({
				username: detail.username,
				// employee: detail.employee?.id,
				role: detail.role?.id
			})
		}
	}, [detail])


	return (
		<>
			<PageTitle title={user?.role === ROLE_LIST.ADMIN ? 'Permissions' : 'Employees'}>
				{
					user?.role === ROLE_LIST.ADMIN ?
						<Button icon={<Plus/>} onClick={() => addParams({modal: 'permission'})}>
							Granting a permission
						</Button> :
						<Button icon={<Plus/>} onClick={() => navigate(`add`)}>
							Add employee
						</Button>
				}
			</PageTitle>
			{
				user?.role === ROLE_LIST.ADMIN ?
					<>
						<Card>
							<ReactTable
								columns={adminColumns}
								data={adminData}
								isLoading={isAdminDataLoading}
							/>
						</Card>
						<Pagination totalPages={adminTotalPages}/>
					</> :
					<>
						<Card>
							<ReactTable
								columns={columns}
								data={data}
								isLoading={isLoading}
							/>
						</Card>
						<Pagination totalPages={totalPages}/>
					</>
			}
			{
				user?.role === ROLE_LIST.ADMIN &&
				<>
					<Modal title="Granting a permission" id="permission" style={{height: '60rem', width: '50rem'}}>
						<Form onSubmit={
							handleAddSubmit(
								(data) => {
									mutateAsync(data)
										.then(async () => {
											resetAdd()
											removeParams('modal')
											await refetch()
										})
								}
							)
						}
						>
							<Controller
								name="employee"
								control={controlAdd}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										ref={ref}
										id="employee"
										label="Employee"
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
								name="role"
								control={controlAdd}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										ref={ref}
										id="brand"
										label="Role"
										options={roles}
										onBlur={onBlur}
										error={addErrors.role?.message}
										value={getSelectValue(roles, value)}
										defaultValue={getSelectValue(roles, value)}
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>

							<Input
								id="username"
								label="Login"
								error={addErrors.username?.message}
								{...registerAdd('username')}
							/>

							<Input
								id="password"
								label="Password"
								type="password"
								error={addErrors.password?.message}
								{...registerAdd('password')}
							/>

							<Input
								id="password_confirm"
								label="Confirm password"
								type="password"
								error={addErrors.password_confirm?.message}
								{...registerAdd('password_confirm')}
							/>

							<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isAdding}>Save</Button>
						</Form>
					</Modal>

					<EditModal
						isLoading={isDetailLoading && !detail}
						style={{height: '35rem', width: '50rem'}}
					>
						<Form
							onSubmit={
								handleEditSubmit(
									(data) => update(data)
										.then(async () => {
											resetEdit()
											removeParams('modal', 'updateId')
											await refetch()
										})
								)
							}
						>

							{/*<Controller*/}
							{/*	name="employee"*/}
							{/*	control={controlEdit}*/}
							{/*	render={({field: {value, ref, onChange, onBlur}}) => (*/}
							{/*		<Select*/}
							{/*			ref={ref}*/}
							{/*			id="employee"*/}
							{/*			label="Employee"*/}
							{/*			disabled={true}*/}
							{/*			onBlur={onBlur}*/}
							{/*			error={editErrors.employee?.message}*/}
							{/*			options={employees}*/}
							{/*			value={getSelectValue(employees, value)}*/}
							{/*			defaultValue={getSelectValue(employees, value)}*/}
							{/*			handleOnChange={(e) => onChange(e as string)}*/}
							{/*		/>*/}
							{/*	)}*/}
							{/*/>*/}

							<Controller
								name="role"
								control={controlEdit}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										ref={ref}
										id="brand"
										label="Role"
										options={roles}
										onBlur={onBlur}
										error={editErrors.role?.message}
										value={getSelectValue(roles, value)}
										defaultValue={getSelectValue(roles, value)}
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>

							<Input
								id="username"
								label="Login"
								error={editErrors.username?.message}
								{...registerEdit('username')}
							/>

							<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isUpdating}>Edit</Button>
						</Form>
					</EditModal>

					<DeleteModal endpoint={'accounts/'} onDelete={() => refetch()}/>
				</>
			}

		</>
	)
}

export default Index