import {AxiosError} from 'axios'
import {AlertItem} from 'components'
import toast, {Toast} from 'react-hot-toast'


const showMessage = (message: string = '', type: 'success' | 'error' | 'alert' = 'alert', duration: number = 5000, position: 'top-right' | 'top-center' = 'top-right'): void => {
	toast.custom(
		(customToast: Toast) => {
			return (
				<AlertItem
					onClose={() => toast.dismiss(customToast.id)}
					visible={customToast.visible}
					type={type}
					title={message}
				/>
			)
		},
		{position, duration}
	)
}


const showErrorMessage = (error: AxiosError<{ [key: string]: string | string[] } | string | string[]>) => {
	const responseData = error?.response?.data

	if (Array.isArray(responseData)) {
		responseData.forEach((err) => showMessage(err, 'error', 10000))
	} else if (typeof responseData === 'object' && responseData !== null) {
		for (const key in responseData) {
			if (Object.prototype.hasOwnProperty.call(responseData, key)) {
				const value = responseData[key]
				if (Array.isArray(value)) {
					value.forEach((err) => showMessage(err, 'error', 10000))
				} else {
					showMessage(value, 'error', 10000)
				}
			}
		}
	} else if (typeof responseData === 'string') {
		showMessage(responseData, 'error', 10000)
	} else {
		showMessage('Internal server error', 'error', 10000)
	}
}


export {
	showErrorMessage,
	showMessage
}