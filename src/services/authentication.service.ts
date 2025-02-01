import {ILogin} from 'interfaces/authentication.interface'
import {ILoginForm} from 'interfaces/yup.interface'
import {interceptor} from 'libraries'


export const AuthenticationService = {
	async login(credentials: ILoginForm) {
		const response = await interceptor.post<ILogin>('accounts/login/', credentials)
		return response.data
	},

	async me() {
		return await interceptor.get<ILogin>('accounts/me/')
	},

	async logout() {
		return await interceptor.get('accounts/logout/')
	}
}