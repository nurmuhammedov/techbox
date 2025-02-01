import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {RouterProvider} from 'react-router-dom'
import {router} from 'configurations/router'
import {createRoot} from 'react-dom/client'
import 'assets/fonts/typography.css'
import {Alert} from 'components'
import 'styles/index.scss'
import 'i18n'


const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false
		}
	}
})


createRoot(document.getElementById('root')!)
	.render(
		<QueryClientProvider client={queryClient}>
			<Alert/>
			<RouterProvider router={router}/>
		</QueryClientProvider>
	)
