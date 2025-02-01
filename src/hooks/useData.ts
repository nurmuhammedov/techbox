import {useQuery} from '@tanstack/react-query'
import {ISearchParams} from 'interfaces/params.interface'
import {useTranslation} from 'react-i18next'
import {CommonService} from 'services/common.service'


const usePaginatedData = <T>(
	endpoint: string,
	enabled: boolean = true,
	params?: ISearchParams
) => {
	const {i18n} = useTranslation()

	return useQuery<T, Error>({
		queryKey: [endpoint, params, i18n.language],
		queryFn: () => CommonService.getData<T>(endpoint, params),
		enabled
	})
}

export default usePaginatedData
