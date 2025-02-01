import {ILogin} from 'interfaces/authentication.interface'
import {ILoginForm} from 'interfaces/yup.interface'
import {useLocation, useNavigate} from 'react-router-dom'
import {useMutation} from '@tanstack/react-query'
import {AuthenticationService} from 'services/authentication.service'
import {showMessage} from 'utilities/alert'
import {routeByRole} from 'utilities/authentication'


export function useLogin() {
	const {state} = useLocation()
	const navigate = useNavigate()

	const handleLogin = (userData: ILogin) => {
		if (state?.from !== '/' && state?.from) navigate(state?.from || routeByRole(userData?.role))
		else navigate(routeByRole(userData?.role))
		showMessage('Successful', 'success')
	}

	const {isPending, mutate: login} = useMutation({
		mutationFn: (credentials: ILoginForm) => AuthenticationService.login(credentials),
		onSuccess: handleLogin
	})

	return {login, isPending}
}
