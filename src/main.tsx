import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {AppContextProvider} from 'contexts/AppContext'
import {BrowserRouter} from 'react-router-dom'
import {createRoot} from 'react-dom/client'
import {Alert, Router} from 'components'
import 'assets/fonts/typography.css'
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
			<BrowserRouter basename="/">
				<AppContextProvider>
					<Router/>
				</AppContextProvider>
				<Alert/>
			</BrowserRouter>
		</QueryClientProvider>
	)
