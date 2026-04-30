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
	FinishedDetail, CompanyOperations,
	PalletLeaderTable,
	OperatorPalletsTable,
	PalletForm,
	PalletDetail,
	UpdateDirectorOrder,
	CommunalsTable,
	AddCommunal,
	AddTariff,
	AddReport
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
					path: 'edit/:id',
					element: <UpdateDirectorOrder />
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
					path: 'edit/:id',
					element: <EditOperatorOrder />
				},
				{
					path: 'detail/:id',
					element: <EditOperatorOrder retrieve={true} />
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
				}
			]
		},
		{
			id: 'operator_fleksa',
			path: 'flex-orders',
			children: [
				{
					index: true,
					element: <FlexTable />
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
					element: <OperatorsTable type="tikish" />
				},
				{
					path: 'edit/:id',
					element: <Process type="sewing" />
				},
				{
					path: 'detail/:id',
					element: <Process retrieve={true} type="sewing" />
				}
			]
		},
		{
			id: 'operator_yelimlash',
			path: 'gluing-orders',
			children: [
				{
					index: true,
					element: <OperatorsTable type="yelimlash" />
				},
				{
					path: 'edit/:id',
					element: <Process type="gluing" />
				},
				{
					path: 'detail/:id',
					element: <Process retrieve={true} type="gluing" />
				}
			]
		},
		{
			id: 'materials',
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
					path: 'edit/:productId',
					element: <AddProduct edit={true} />
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
			id: 'company_operations',
			path: 'company-operations',
			element: <CompanyOperations />
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
			path: 'pallet-operator-flex',
			children: [
				{
					index: true,
					element: <OperatorPalletsTable type="fleksa" />
				},
				{
					path: 'add',
					element: <PalletForm type="fleksa" />
				}
			]
		},
		{
			id: 'pallet_glue',
			path: 'pallet-operator-glue',
			children: [
				{
					index: true,
					element: <OperatorPalletsTable type="yelimlash" />
				},
				{
					path: 'add',
					element: <PalletForm type="yelimlash" />
				}
			]
		},
		{
			id: 'pallet_bet',
			path: 'pallet-operator-sewing',
			children: [
				{
					index: true,
					element: <OperatorPalletsTable type="tikish" />
				},
				{
					path: 'add',
					element: <PalletForm type="tikish" />
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
				},
				{
					path: 'edit/:id',
					element: <AddChemicals edit={true} />
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
			id: 'storekeeper',
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

	const adminChildren = [
		{
			index: true,
			element: <Navigate to={routeByRole(user?.role)} replace />
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
			id: 'materials',
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
				},
				{
					path: 'edit/:id',
					element: <AddChemicals edit={true} />
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
					path: 'edit/:productId',
					element: <AddProduct edit={true} />
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

	const filteredEmployeeRoutes = employeeRoutes.filter(route => userPermissions.includes(route?.id))
	const filteredAdminRoutes = adminChildren.filter(route => route.index || userPermissions.includes(route?.id))

	let url = routeByRole(user?.role)
	if (user?.role === ROLE_LIST.EMPLOYEE && filteredEmployeeRoutes?.length) {
		url = '/' + filteredEmployeeRoutes[0].path
	}

	const routes = {
		[ROLE_LIST.ADMIN]: [
			{
				path: '/',
				element: <Layout />,
				children: filteredAdminRoutes
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
				children: [
					{
						index: true,
						element: <Navigate to={url} replace />
					},
					...filteredEmployeeRoutes
				]
			},
			{
				path: '*',
				element: <Navigate to={routeByRole(user?.role)} replace />
			}
		]
	}

	return useRoutes(user ? routes[user.role] : [{ path: '*', element: <Login /> }])
}

export default useAppRoutes