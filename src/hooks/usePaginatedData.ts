import {IListResponse} from 'interfaces/configuration.interface'
import {useQuery} from '@tanstack/react-query'
import {ISearchParams} from 'interfaces/params.interface'
import {CommonService} from 'services/common.service'
import {useTranslation} from 'react-i18next'


const usePaginatedData = <T>(endpoint: string, params?: ISearchParams, enabled: boolean = true) => {
	const {i18n} = useTranslation()
	const queryMethods = useQuery<IListResponse<T>, Error>({
		queryKey: [endpoint, params, i18n.language],
		queryFn: () => CommonService.getPaginatedData<T>(endpoint, params),
		enabled
	})

	const {results = [], num_pages = 1} = queryMethods.data || {}

	return {
		...queryMethods,
		data: results,
		totalPages: num_pages
	}
}

export default usePaginatedData
