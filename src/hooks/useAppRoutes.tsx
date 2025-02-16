import {AddEmployee, EmployeesTable, Login, MaterialsTable, AddProduct, ProductsTable} from 'modules'
import {AddClient, ClientsTable} from 'modules/clients'
import {Navigate, useRoutes} from 'react-router-dom'
import {routeByRole} from 'utilities/authentication'
import {WarehouseTable} from 'modules/warehouse'
import {ROLE_LIST} from 'constants/roles'
import {RolesTable} from 'modules/roles'
import {AddOrder, OrdersTable} from 'modules/orders'
import {useAppContext} from 'hooks'
import {Layout} from 'components'


function useAppRoutes() {
	const {user} = useAppContext()

	const routes = {
		[ROLE_LIST.ADMIN]: [
			{
				path: '/',
				element: <Layout/>,
				children: [
					{
						index: true,
						element: <Navigate to={routeByRole(user?.role)} replace/>
					},
					{
						path: 'roles',
						children: [
							{
								index: true,
								element: <RolesTable/>
							}
						]
					},
					{
						path: 'permissions',
						children: [
							{
								index: true,
								element: <EmployeesTable/>
							}
						]
					},
					{
						path: 'materials',
						children: [
							{
								index: true,
								element: <MaterialsTable/>
							}
						]
					},
					{
						path: 'warehouses',
						children: [
							{
								index: true,
								element: <WarehouseTable/>
							}
						]
					},
					{
						path: 'products',
						children: [
							{
								index: true,
								element: <ProductsTable/>
							},
							{
								path: 'add',
								element: <AddProduct/>
							},
							{
								path: 'edit/:id',
								element: <AddProduct edit={true}/>
							}
						]
					},
					{
						path: 'clients',
						children: [
							{
								index: true,
								element: <ClientsTable/>
							},
							{
								path: 'add',
								element: <AddClient/>
							},
							{
								path: 'edit/:id',
								element: <AddClient edit={true}/>
							}
						]
					},
					{
						path: 'orders',
						children: [
							{
								index: true,
								element: <ClientsTable order={true}/>
							},
							{
								path: ':id',
								children: [
									{
										index: true,
										element: <OrdersTable/>
									},
									{
										path: 'add',
										element: <AddOrder/>
									},
									{
										path: 'edit/:orderId',
										element: <AddOrder edit={true}/>
									}
								]
							}
						]
					}
				]
			},
			{
				path: '*',
				element: <Navigate to={routeByRole(user?.role)} replace/>
			}
		],
		[ROLE_LIST.HEAD_DEPARTMENT]: [
			{
				path: '/',
				element: <Layout/>,
				children: [
					{
						index: true,
						element: <Navigate to={routeByRole(user?.role)} replace/>
					},
					{
						path: 'employees',
						children: [
							{
								index: true,
								element: <EmployeesTable/>
							},
							{
								path: 'add',
								element: <AddEmployee/>
							},
							{
								path: 'edit/:id',
								element: <AddEmployee edit={true}/>
							}
						]
					}
				]
			},
			{
				path: '*',
				element: <Navigate to={routeByRole(user?.role)} replace/>
			}
		],
		[ROLE_LIST.EMPLOYEE]: [
			{
				path: '/',
				element: <Layout/>,
				children: [
					{
						index: true,
						element: <Navigate to={routeByRole(user?.role)} replace/>
					}
				]
			},
			{
				path: '*',
				element: <Navigate to={routeByRole(user?.role)} replace/>
			}
		],
		default: [
			{
				path: '/login',
				element: <Login/>
			},
			{
				path: '*',
				element: <Navigate to="/login" replace/>
			}
		]
	}

	return useRoutes(routes[user?.role ?? 'default'] || routes.default)
}

export default useAppRoutes