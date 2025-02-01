import {useMutation} from '@tanstack/react-query'
import {CommonService} from 'services/common.service'
import {showMessage} from 'utilities/alert'


const useDynamicMutation = <TVariables, TData, TError>(endpoint: string, successMessage: string = 'Saved successfully', errorMessage?: string) => {
	return useMutation<TData, TError, TVariables>({
		mutationFn: (data: TVariables) => CommonService.addData<TVariables, TData>(endpoint, data),
		onSuccess: () => showMessage(successMessage, 'success'),
		onError: () => {
			if (errorMessage) {
				showMessage(errorMessage, 'error')
			}
		}
	})
}

export default useDynamicMutation