import {ISearchParams} from 'interfaces/params.interface'
import {useSearchParams} from 'react-router-dom'
import {isObject} from 'utilities/common'
import {convertParamsToObject} from 'utilities/params'


function useCustomSearchParams() {
	const [searchParams, setSearchParams] = useSearchParams()
	const paramsObj: ISearchParams = convertParamsToObject(searchParams)
	const paramsStr: string = searchParams.toString()

	function addParams(paramKeyOrObj: ISearchParams, ...removeKeys: string[]): void {
		if (!paramKeyOrObj) return

		let newParams: ISearchParams = {...paramsObj}

		if (removeKeys && removeKeys.length > 0) {
			removeKeys.forEach((key) => {
				delete newParams[key]
			})
		}

		delete newParams['page']
		delete newParams['limit']

		if (isObject(paramKeyOrObj)) {
			newParams = {...newParams, ...paramKeyOrObj}
		}

		setSearchParams(newParams as unknown as URLSearchParams, {replace: true})
	}

	function removeParams(...paramKeys: string[]): void {
		const paramsCopy: ISearchParams = {...paramsObj}
		paramKeys.forEach((pk) => {
			delete paramsCopy[pk]
		})
		delete paramsCopy['page']
		delete paramsCopy['limit']
		setSearchParams(paramsCopy as unknown as URLSearchParams, {replace: true})
	}

	function clearParams(): void {
		setSearchParams({}, {replace: true})
	}

	return {
		paramsObject: paramsObj,
		paramsString: paramsStr,
		addParams,
		removeParams,
		clearParams
	}
}

export default useCustomSearchParams