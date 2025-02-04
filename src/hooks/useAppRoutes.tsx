import {RolesTable} from 'modules/roles'
import {Navigate, useRoutes} from 'react-router-dom'
import {routeByRole} from 'utilities/authentication'
import {ROLE_LIST} from 'constants/roles'
import {useAppContext} from 'hooks'
import {Layout} from 'components'
import {EmployeesTable, Login} from 'modules'


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
