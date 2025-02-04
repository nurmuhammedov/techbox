import {AuthenticationService} from 'services/authentication.service'
import {useMutation} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'
import {useAppContext} from 'hooks'


export default function useLogout() {
	const navigate = useNavigate()
	const {setUser} = useAppContext()
	const {mutate: handleLogout, isPending} = useMutation({
		mutationFn: AuthenticationService.logout,
		onSuccess: () => {
			setUser(null)
			navigate('/login', {replace: true})
		}
	})

	return {handleLogout, isPending}
}