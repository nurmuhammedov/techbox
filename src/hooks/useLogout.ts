import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'
import {AuthenticationService} from 'services/authentication.service'


export default function Index() {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const {mutate: handleLogout, isPending} = useMutation({
		mutationFn: AuthenticationService.logout,
		onSuccess: () => {
			navigate('/login', {replace: true})
			// document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=Strict'
			// document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=Strict'
			queryClient.clear()
		}
	})

	return {handleLogout, isPending}
}