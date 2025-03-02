import {
	AddEmployee,
	EmployeesTable,
	Login,
	MaterialsTable,
	AddProduct,
	ProductsTable,
	WarehouseManTable,
	WarehouseOrder,
	FormatsTable,
	RolesTable,
	WarehouseTable,
	ClientsTable,
	AddClient,
	OrdersTable,
	AddOrder,
	DirectorOrdersTable,
	AddDirectorOrder,
	OperatorOrdersTable,
	EditOperatorOrder,
	OperatorsTable,
	OperatorsForm
} from 'modules'
import {Navigate, useRoutes} from 'react-router-dom'
import {routeByRole} from 'utilities/authentication'
import {ROLE_LIST} from 'constants/roles'
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
						path: 'formats',
						children: [
							{
								index: true,
								element: <FormatsTable/>
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
						path: 'director-orders',
						children: [
							{
								index: true,
								element: <DirectorOrdersTable/>
							},
							{
								path: 'add',
								element: <AddDirectorOrder/>
							}
						]
					},
					{
						path: 'operator-orders',
						children: [
							{
								index: true,
								element: <OperatorOrdersTable/>
							},
							{
								path: 'edit/:id',
								element: <EditOperatorOrder/>
							},
							{
								path: 'detail/:id',
								element: <EditOperatorOrder retrieve={true}/>
							}
						]
					},
					{
						path: 'corrugation-orders',
						children: [
							{
								index: true,
								element: <OperatorsTable type="gofra"/>
							},
							{
								path: 'edit/:id',
								element: <OperatorsForm type="corrugation"/>
							},
							{
								path: 'detail/:id',
								element: <OperatorsForm retrieve={true} type="corrugation"/>
							}
						]
					},
					{
						path: 'flex-orders',
						children: [
							{
								index: true,
								element: <OperatorsTable type="fleksa"/>
							},
							{
								path: 'edit/:id',
								element: <OperatorsForm type="flex"/>
							},
							{
								path: 'detail/:id',
								element: <OperatorsForm retrieve={true} type="flex"/>
							}
						]
					},
					{
						path: 'sewing-orders',
						children: [
							{
								index: true,
								element: <OperatorsTable type="tikish"/>
							},
							{
								path: 'edit/:id',
								element: <OperatorsForm type="sewing"/>
							},
							{
								path: 'detail/:id',
								element: <OperatorsForm retrieve={true} type="sewing"/>
							}
						]
					},
					{
						path: 'gluing-orders',
						children: [
							{
								index: true,
								element: <OperatorsTable type="yelimlash"/>
							},
							{
								path: 'edit/:id',
								element: <OperatorsForm type="gluing"/>
							},
							{
								path: 'detail/:id',
								element: <OperatorsForm retrieve={true} type="gluing"/>
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
					},
					{
						path: 'warehouses-man',
						children: [
							{
								index: true,
								element: <WarehouseManTable/>
							},
							{
								path: 'add',
								element: <WarehouseOrder/>
							},
							{
								path: 'edit/:orderId',
								element: <WarehouseOrder edit={true}/>
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