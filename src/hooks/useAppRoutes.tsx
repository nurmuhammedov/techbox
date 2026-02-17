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
	ClientAndOrderAdd,
	FlexTable,
	FlexOrderForm,
	Process,
	WarehouseDetail,
	SemiFinishedDetail,
	FinishedDetail, CompanyOperations
} from 'modules'
import { Navigate, useRoutes } from 'react-router-dom'
import { routeByRole } from 'utilities/authentication'
import { ROLE_LIST } from 'constants/roles'
import { useAppContext } from 'hooks'
import { Layout } from 'components'
import { ChemicalTypesTable } from 'modules/chemical-types'
import { AddChemicals, ChemicalsTable } from 'modules/chemicals'
import { AddGlue, GlueTable } from 'modules/Glue'
import CorrugationForm from 'modules/operator-orders/screens/CorrugationForm'


function useAppRoutes() {
	const { user } = useAppContext()

	const userPermissions = user?.permissions || []

	const employeeRoutes = [
		{
			id: 'human_resources',
			path: 'employees',
			children: [
				{
					index: true,
					element: <EmployeesTable />
				},
				{
					path: 'add',
					element: <AddEmployee />
				},
				{
					path: 'edit/:id',
					element: <AddEmployee edit={true} />
				}
			]
		},
		{
			id: 'role',
			path: 'roles',
			children: [
				{
					index: true,
					element: <RolesTable />
				}
			]
		},
		{
			id: 'chemical_types',
			path: 'chemical-types',
			children: [
				{
					index: true,
					element: <ChemicalTypesTable />
				}
			]
		},
		{
			id: 'material_type',
			path: 'materials',
			children: [
				{
					index: true,
					element: <MaterialsTable />
				}
			]
		},
		{
			id: 'format',
			path: 'formats',
			children: [
				{
					index: true,
					element: <FormatsTable />
				}
			]
		},
		{
			id: 'storekeeper',
			path: 'warehouses',
			children: [
				{
					index: true,
					element: <WarehouseTable />
				},
				{
					path: 'warehouse-detail/:id',
					element: <WarehouseDetail />
				},
				{
					path: 'semi-finished-detail/:id',
					element: <SemiFinishedDetail />
				},
				{
					path: 'finished-detail/:id',
					element: <FinishedDetail />
				}
			]
		},
		{
			id: 'products',
			path: 'products',
			children: [
				{
					index: true,
					element: <ProductsTable />
				},
				{
					path: 'add',
					element: <AddProduct />
				},
				{
					path: 'edit/:id',
					element: <AddProduct edit={true} />
				}
			]
		},
		{
			id: 'chemicals',
			path: 'chemicals',
			children: [
				{
					index: true,
					element: <ChemicalsTable />
				},
				{
					path: 'add',
					element: <AddChemicals />
				}
			]
		},
		{
			id: 'glue',
			path: 'glue',
			children: [
				{
					index: true,
					element: <GlueTable />
				},
				{
					path: 'add',
					element: <AddGlue />
				}
			]
		},
		{
			id: 'leader',
			path: 'director-orders',
			children: [
				{
					index: true,
					element: <DirectorOrdersTable />
				},
				{
					path: 'add',
					element: <AddDirectorOrder />
				},
				{
					path: 'process/:id',
					element: <Process />
				}
			]
		},
		{
			id: 'operator',
			path: 'operator-orders',
			children: [
				{
					index: true,
					element: <OperatorOrdersTable />
				},
				{
					path: 'add',
					element: <EditOperatorOrder />
				},
				{
					path: 'detail/:id',
					element: <CorrugationForm detail={true} />
				}
			]
		},
		{
			id: 'company_operations',
			path: 'company-operations',
			children: [
				{
					index: true,
					element: <CompanyOperations />
				},
				{
					path: 'add',
					element: <AddDirectorOrder />
				},
				{
					path: 'process/:id',
					element: <Process update={true} />
				}
			]
		},
		{
			id: 'operator_gofra',
			path: 'corrugation-orders',
			children: [
				{
					index: true,
					element: <OperatorsTable type="gofra" />
				},
				{
					path: 'edit/:id',
					element: <CorrugationForm />
				},
				{
					path: 'detail/:id',
					element: <CorrugationForm detail={true} />
				}
			]
		},
		{
			id: 'operator_fleksa',
			path: 'flex-orders',
			children: [
				{
					index: true,
					element: <FlexTable type="fleksa" />
				},
				{
					path: 'edit/:id',
					element: <FlexOrderForm type="flex" />
				},
				{
					path: 'detail/:id',
					element: <FlexOrderForm retrieve={true} type="flex" />
				}
			]
		},
		{
			id: 'operator_tikish',
			path: 'sewing-orders',
			children: [
				{
					index: true,
					element: <FlexTable type="tikish" />
				},
				{
					path: 'edit/:id',
					element: <FlexOrderForm type="sewing" />
				},
				{
					path: 'detail/:id',
					element: <FlexOrderForm retrieve={true} type="sewing" />
				}
			]
		},
		{
			id: 'operator_yelimlash',
			path: 'gluing-orders',
			children: [
				{
					index: true,
					element: <FlexTable type="yelimlash" />
				},
				{
					path: 'edit/:id',
					element: <FlexOrderForm type="gluing" />
				},
				{
					path: 'detail/:id',
					element: <FlexOrderForm retrieve={true} type="gluing" />
				}
			]
		},
		{
			id: 'customers',
			path: 'clients',
			children: [
				{
					index: true,
					element: <ClientsTable />
				},
				{
					path: 'add',
					element: <AddClient />
				},
				{
					path: 'edit/:id',
					element: <AddClient edit={true} />
				}
			]
		},
		{
			id: 'orders',
			path: 'orders',
			children: [
				{
					index: true,
					element: <ClientsTable order={true} />
				},
				{
					path: 'add',
					element: <ClientAndOrderAdd />
				},
				{
					path: ':id',
					children: [
						{
							index: true,
							element: <OrdersTable />
						},
						{
							path: 'add',
							element: <AddOrder />
						},
						{
							path: 'edit/:orderId',
							element: <AddOrder edit={true} />
						}
					]
				}
			]
		},
		{
			id: 'materials',
			path: 'warehouses-man',
			children: [
				{
					index: true,
					element: <WarehouseManTable />
				},
				{
					path: 'add',
					element: <WarehouseOrder />
				},
				{
					path: 'edit/:orderId',
					element: <WarehouseOrder edit={true} />
				}
			]
		}
	]

	const filteredEmployeeRoutes = employeeRoutes.filter(route => userPermissions.includes(route?.id))
	let url = routeByRole(user?.role)
	if (user?.role === ROLE_LIST.EMPLOYEE && filteredEmployeeRoutes?.length) {
		url = '/' + filteredEmployeeRoutes[0].path
	}

	const routes = {
		[ROLE_LIST.ADMIN]: [
			{
				path: '/',
				element: <Layout />,
				children: [
					{
						index: true,
						element: <Navigate to={routeByRole(user?.role)} replace />
					},
					{
						path: 'roles',
						children: [
							{
								index: true,
								element: <RolesTable />
							}
						]
					},
					{
						path: 'permissions',
						children: [
							{
								index: true,
								element: <EmployeesTable />
							}
						]
					},
					{
						path: 'materials',
						children: [
							{
								index: true,
								element: <MaterialsTable />
							}
						]
					},
					{
						path: 'formats',
						children: [
							{
								index: true,
								element: <FormatsTable />
							}
						]
					},
					{
						path: 'warehouses',
						children: [
							{
								index: true,
								element: <WarehouseTable />
							},
							{
								path: 'warehouse-detail/:id',
								element: <WarehouseDetail />
							},
							{
								path: 'semi-finished-detail/:id',
								element: <SemiFinishedDetail />
							},
							{
								path: 'finished-detail/:id',
								element: <FinishedDetail />
							}
						]
					},
					{
						path: 'products',
						children: [
							{
								index: true,
								element: <ProductsTable />
							},
							{
								path: 'add',
								element: <AddProduct />
							},
							{
								path: 'edit/:id',
								element: <AddProduct edit={true} />
							}
						]
					},
					{
						id: 'chemicals',
						path: 'chemicals',
						children: [
							{
								index: true,
								element: <ChemicalsTable />
							},
							{
								path: 'add',
								element: <AddChemicals />
							}
						]
					},
					{
						id: 'glue',
						path: 'glue',
						children: [
							{
								index: true,
								element: <GlueTable />
							},
							{
								path: 'add',
								element: <AddGlue />
							}
						]
					},
					{
						path: 'chemical-types',
						children: [
							{
								index: true,
								element: <ChemicalTypesTable />
							}
						]
					},
					// {
					// 	path: 'director-orders',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <DirectorOrdersTable/>
					// 		},
					// 		{
					// 			path: 'add',
					// 			element: <AddDirectorOrder/>
					// 		}
					// 	]
					// },
					// {
					// 	path: 'operator-orders',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <OperatorOrdersTable/>
					// 		},
					// 		{
					// 			path: 'edit/:id',
					// 			element: <EditOperatorOrder/>
					// 		},
					// 		{
					// 			path: 'detail/:id',
					// 			element: <EditOperatorOrder retrieve={true}/>
					// 		}
					// 	]
					// },
					// {
					// 	path: 'corrugation-orders',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <OperatorsTable type="gofra"/>
					// 		},
					// 		{
					// 			path: 'edit/:id',
					// 			element: <OperatorsForm type="corrugation"/>
					// 		},
					// 		{
					// 			path: 'detail/:id',
					// 			element: <OperatorsForm retrieve={true} type="corrugation"/>
					// 		}
					// 	]
					// },
					// {
					// 	path: 'flex-orders',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <OperatorsTable type="fleksa"/>
					// 		},
					// 		{
					// 			path: 'edit/:id',
					// 			element: <OperatorsForm type="flex"/>
					// 		},
					// 		{
					// 			path: 'detail/:id',
					// 			element: <OperatorsForm retrieve={true} type="flex"/>
					// 		}
					// 	]
					// },
					// {
					// 	path: 'sewing-orders',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <OperatorsTable type="tikish"/>
					// 		},
					// 		{
					// 			path: 'edit/:id',
					// 			element: <OperatorsForm type="sewing"/>
					// 		},
					// 		{
					// 			path: 'detail/:id',
					// 			element: <OperatorsForm retrieve={true} type="sewing"/>
					// 		}
					// 	]
					// },
					// {
					// 	path: 'gluing-orders',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <OperatorsTable type="yelimlash"/>
					// 		},
					// 		{
					// 			path: 'edit/:id',
					// 			element: <OperatorsForm type="gluing"/>
					// 		},
					// 		{
					// 			path: 'detail/:id',
					// 			element: <OperatorsForm retrieve={true} type="gluing"/>
					// 		}
					// 	]
					// },
					{
						path: 'clients',
						children: [
							{
								index: true,
								element: <ClientsTable />
							},
							{
								path: 'add',
								element: <AddClient />
							},
							{
								path: 'edit/:id',
								element: <AddClient edit={true} />
							}
						]
					}
					// {
					// 	path: 'orders',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <ClientsTable order={true}/>
					// 		},
					// 		{
					// 			path: ':id',
					// 			children: [
					// 				{
					// 					index: true,
					// 					element: <OrdersTable/>
					// 				},
					// 				{
					// 					path: 'add',
					// 					element: <AddOrder/>
					// 				},
					// 				{
					// 					path: 'edit/:orderId',
					// 					element: <AddOrder edit={true}/>
					// 				}
					// 			]
					// 		}
					// 	]
					// },
					// {
					// 	path: 'warehouses-man',
					// 	children: [
					// 		{
					// 			index: true,
					// 			element: <WarehouseManTable/>
					// 		},
					// 		{
					// 			path: 'add',
					// 			element: <WarehouseOrder/>
					// 		},
					// 		{
					// 			path: 'edit/:orderId',
					// 			element: <WarehouseOrder edit={true}/>
					// 		}
					// 	]
					// }
				]
			},
			{
				path: '*',
				element: <Navigate to={routeByRole(user?.role)} replace />
			}
		],
		[ROLE_LIST.HEAD_DEPARTMENT]: [
			{
				path: '/',
				element: <Layout />,
				children: [
					{
						index: true,
						element: <Navigate to={routeByRole(user?.role)} replace />
					},
					{
						path: 'employees',
						children: [
							{
								index: true,
								element: <EmployeesTable />
							},
							{
								path: 'add',
								element: <AddEmployee />
							},
							{
								path: 'edit/:id',
								element: <AddEmployee edit={true} />
							}
						]
					}
				]
			},
			{
				path: '*',
				element: <Navigate to={routeByRole(user?.role)} replace />
			}
		],
		[ROLE_LIST.EMPLOYEE]: [
			{
				path: '/',
				element: <Layout />,
				children: filteredEmployeeRoutes?.length ? [
					{
						index: true,
						element: <Navigate to={url} replace />
					},
					...filteredEmployeeRoutes
				] : [
					{
						index: true,
						element: <></>
					}
				]
			},
			{
				path: '*',
				element:
					<Navigate
						to={url}
						replace
					/>
			}
		],
		default: [
			{
				path: '/login',
				element: <Login />
			},
			{
				path: '*',
				element: <Navigate to="/login" replace />
			}
		]
	}

	return useRoutes(routes[user?.role ?? 'default'] || routes.default)
}

export default useAppRoutes