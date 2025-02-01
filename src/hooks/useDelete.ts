import {useMutation} from '@tanstack/react-query'
import {CommonService} from 'services/common.service'
import {showMessage} from 'utilities/alert'
import {noopAsync} from 'utilities/common'


const useDynamicDeleteMutation = (
	endpoint: string,
	id?: string | number | boolean | null,
	successMessage: string = 'Deleted successfully',
	errorMessage?: string
) => {
	return useMutation({
		mutationFn: () => {
			if (id) {
				return CommonService.deleteData(endpoint, id?.toString())
			} else {
				showMessage('ID is required to perform delete operation', 'error')
			}
			return noopAsync()
		},
		onSuccess: () => showMessage(successMessage, 'success'),
		onError: () => {
			if (errorMessage) {
				showMessage(errorMessage, 'error')
			}
		}
	})
}

export default useDynamicDeleteMutation
