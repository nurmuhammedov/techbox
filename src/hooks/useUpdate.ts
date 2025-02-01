import {useMutation} from '@tanstack/react-query'
import {CommonService} from 'services/common.service'
import {showMessage} from 'utilities/alert'


const useDynamicUpdateMutation = <TVariables, TData, TError>(
	endpoint: string,
	id?: string | number | boolean | null,
	method: 'put' | 'patch' = 'put',
	successMessage: string = 'Updated successfully',
	errorMessage?: string
) => {
	return useMutation<TData, TError, TVariables>({
		mutationFn: async (data: TVariables) => {
			if (!id && id !== 0) {
				const errorMsg = `ID required: The operation cannot be completed because a valid ID was not provided. Please ensure you pass a valid ID when updating data at endpoint: "${endpoint}".`
				showMessage(errorMsg, 'error')
				return Promise.reject(new Error(errorMsg))
			}

			return method === 'put'
				? CommonService.updateData<TVariables, TData>(endpoint, data, id.toString())
				: CommonService.partialUpdateData<TVariables, TData>(endpoint, data, id.toString())
		},
		onSuccess: () => showMessage(successMessage, 'success'),
		onError: () => {
			showMessage(errorMessage, 'error')
		}
	})
}

export default useDynamicUpdateMutation
