import {App} from 'components'
import {createBrowserRouter, Navigate} from 'react-router-dom'

// Screens
import {
	EmployeesTable,
	Login
} from 'modules'


export const router = createBrowserRouter([
	{
		path: '/',
		element: <App/>,
		children: [
			{
				path: 'employees',
				element: <EmployeesTable/>
			},
			{
				path: 'roles',
				element: <></>
			}
		],
		errorElement: <h1>Error</h1>
	},
	{
		path: '/login',
		element: <Login/>,
		errorElement: <h1>Error</h1>
	},
	{
		path: '*',
		element: <Navigate to="/"/>,
		errorElement: <h1>Error</h1>
	}
])