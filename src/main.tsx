import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {AppContextProvider} from 'contexts/AppContext'
import {BrowserRouter} from 'react-router-dom'
import {createRoot} from 'react-dom/client'
import {Alert, Router} from 'components'
import {Provider} from 'react-redux'
import 'assets/fonts/typography.css'
import {store} from 'store'
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
		<BrowserRouter basename="/">
			<Provider store={store}>
				<QueryClientProvider client={queryClient}>
					<AppContextProvider>
						<Router/>
					</AppContextProvider>
					<Alert/>
				</QueryClientProvider>
			</Provider>
		</BrowserRouter>
	)
