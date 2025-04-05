import {showErrorMessage, showMessage} from 'utilities/alert'
import {BASE_URL} from 'configurations/environment'
import {cleanParams} from 'utilities/common'
import axios from 'axios'


const instance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true
})

instance.interceptors.request.use(
	config => {
		if (config.params) {
			config.params = cleanParams(config.params)
		}
		return config
	},
	error => Promise.reject(error)
)

instance.interceptors.response.use(
	response => response,
	error => {
		if (error?.response?.status <= 499 && error?.response?.status !== 401 && error?.response?.status !== 404) {
			showErrorMessage(error)
		} else if (error?.response?.status >= 500) {
			showMessage('Internal server error', 'error', 15000)
		} else if (error?.response?.status === 401 && (error?.response?.config?.url === 'accounts/me' || error?.response?.config?.url === 'accounts/login')) {
			showMessage('Invalid or missing authentication token', 'alert', 15000)
		} else if (error?.response?.status === 404 && error?.response?.config?.url === 'accounts/login') {
			showMessage('Invalid username or password', 'error', 15000)
		} else if (error?.response?.status === 404) {
			showMessage('API not found', 'error', 15000)
		}
		return Promise.reject(error)
	}
)

export default instance
