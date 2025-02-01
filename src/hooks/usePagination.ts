import {useSearchParams} from 'hooks'


interface IProperties {
	page?: string
	pageSize?: string
}

function usePagination({page = 'page', pageSize = 'pageSize'}: IProperties = {}) {
	const {paramsObject, removeParams, addParams} = useSearchParams()
	const currentPage = Number(paramsObject[page]) || 1
	const currentPageSize = Number(paramsObject[pageSize]) || 5

	const onPageChange = (selectedValue: number): void => {
		if (selectedValue <= 1) {
			removeParams(page)
		} else {
			addParams({[page]: selectedValue})
		}
	}

	const onPageSizeChange = (selectedValue: number | undefined | null | string): void => {
		if (selectedValue === 5 || !selectedValue) {
			removeParams(pageSize, page)
		} else {
			addParams({[pageSize]: selectedValue}, page)
		}
	}

	return {
		page: currentPage,
		pageSize: currentPageSize,
		onPageChange,
		onPageSizeChange
	}
}

export default usePagination