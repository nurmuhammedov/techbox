import {useMemo} from 'react'
import {Navigate, RouteObject, useRoutes} from 'react-router-dom'
import {useAppContext} from 'hooks'
import {ROLE_LIST} from 'constants/roles'
import {Layout} from 'components'
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
	FinishedDetail,
	CompanyOperations,
	PalletLeaderTable,
	OperatorPalletsTable,
	PalletForm,
	PalletDetail,
	UpdateDirectorOrder,
	CommunalsTable,
	AddTariff,
	AddReport,
	ChemicalTypesTable,
	ChemicalsTable,
	AddChemicals as AddChemical,
	GlueTable,
	AddGlue,
	CorrugationForm, AddCommunal
} from 'modules'


const routeByRole = (role?: string) => {
	switch (role) {
		case ROLE_LIST.ADMIN:
			return '/employees'
		case ROLE_LIST.LEADER:
			return '/director-orders'
		case ROLE_LIST.EMPLOYEE:
			return '/operator-orders'
		case ROLE_LIST.STOREKEEPER:
			return '/warehouses'
		case ROLE_LIST.OPERATOR:
			return '/operator-orders'
		case ROLE_LIST.HEAD_DEPARTMENT:
			return '/employees'
		default:
			return '/login'
	}
}

const useAppRoutes = () => {
	const {user} = useAppContext()
	const userCategories = useMemo(() => {
		return user?.categories || []
	}, [user])

	const employeeRoutes: (RouteObject & { id: string })[] = [
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
			id: 'permissions',
			path: 'permissions',
			children: [
				{
					index: true,
					element: <EmployeesTable />
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
					element: <AddChemical />
				},
				{
					path: 'edit/:id',
					element: <AddChemical edit={true} />
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
				},
				{
					path: 'edit/:id',
					element: <AddGlue edit={true} />
				}
			]
		},
		{
			id: 'leader',
			path: 'director-orders',
			children: [
				{
					index: true,
					element: <DirectorOrdersTable leader={true}/>
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
					element: <EditOperatorOrder retrieve={true} />
				},
				{
					path: 'process/:id',
					element: <Process update={true} />
				},
				{
					path: 'edit-group/:id',
					element: <UpdateDirectorOrder />
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
					element: <CorrugationForm retrieve={true} />
				},
				{
					path: 'pallet-detail/:id',
					element: <PalletDetail />
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
					element: <FlexOrderForm />
				},
				{
					path: 'detail/:id',
					element: <FlexOrderForm retrieve={true} />
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
			id: 'pallet_leader',
			path: 'pallet-leader',
			children: [
				{
					index: true,
					element: <PalletLeaderTable />
				},
				{
					path: 'detail/:id',
					element: <PalletDetail />
				}
			]
		},
		{
			id: 'pallet_flex',
			path: 'pallet-flex',
			children: [
				{
					index: true,
					element: <OperatorPalletsTable type="flex" />
				},
				{
					path: 'edit/:id',
					element: <PalletForm type="flex" />
				},
				{
					path: 'detail/:id',
					element: <PalletForm retrieve={true} type="flex" />
				}
			]
		},
		{
			id: 'pallet_glue',
			path: 'pallet-glue',
			children: [
				{
					index: true,
					element: <OperatorPalletsTable type="glue" />
				},
				{
					path: 'edit/:id',
					element: <PalletForm type="glue" />
				},
				{
					path: 'detail/:id',
					element: <PalletForm retrieve={true} type="glue" />
				}
			]
		},
		{
			id: 'pallet_bet',
			path: 'pallet-bet',
			children: [
				{
					index: true,
					element: <OperatorPalletsTable type="bet" />
				},
				{
					path: 'edit/:id',
					element: <PalletForm type="bet" />
				},
				{
					path: 'detail/:id',
					element: <PalletForm retrieve={true} type="bet" />
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
		},
		{
			id: 'communal',
			path: 'communals',
			children: [
				{
					index: true,
					element: <CommunalsTable />
				},
				{
					path: 'add',
					element: <AddCommunal />
				},
				{
					path: 'edit/:id',
					element: <AddCommunal edit={true} />
				},
				{
					path: 'add-tariff',
					element: <AddTariff />
				},
				{
					path: 'edit-tariff/:id',
					element: <AddTariff edit={true} />
				},
				{
					path: 'add-report',
					element: <AddReport />
				},
				{
					path: 'edit-report/:id',
					element: <AddReport edit={true} />
				}
			]
		}
	]

	const filteredEmployeeRoutes = employeeRoutes.filter(route => userCategories.includes(route?.id as string))

	let url = routeByRole(user?.role)
	if (user?.role === ROLE_LIST.EMPLOYEE && filteredEmployeeRoutes?.length) {
		url = '/' + filteredEmployeeRoutes[0].path
	}

	const commonChildren: RouteObject[] = [
		{
			index: true,
			element: <Navigate to={url} replace />
		},
		...employeeRoutes
	]

	const adminChildren: RouteObject[] = [
		{
			index: true,
			element: <Navigate to={url} replace />
		},
		...employeeRoutes
	]

	const routes = {
		[ROLE_LIST.ADMIN]: [
			{
				path: '/',
				element: user?.role ? <Layout /> : <Login />,
				children: adminChildren
			}
		],
		[ROLE_LIST.LEADER]: [
			{
				path: '/',
				element: user?.role ? <Layout /> : <Login />,
				children: commonChildren
			}
		],
		[ROLE_LIST.EMPLOYEE]: [
			{
				path: '/',
				element: user?.role ? <Layout /> : <Login />,
				children: commonChildren
			}
		],
		[ROLE_LIST.STOREKEEPER]: [
			{
				path: '/',
				element: user?.role ? <Layout /> : <Login />,
				children: commonChildren
			}
		],
		[ROLE_LIST.OPERATOR]: [
			{
				path: '/',
				element: user?.role ? <Layout /> : <Login />,
				children: commonChildren
			}
		],
		[ROLE_LIST.HEAD_DEPARTMENT]: [
			{
				path: '/',
				element: user?.role ? <Layout /> : <Login />,
				children: adminChildren
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

	return useRoutes(routes[user?.role as keyof typeof routes] || routes.default)
}

export default useAppRoutes