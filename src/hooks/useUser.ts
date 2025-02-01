import {useQuery} from '@tanstack/react-query'
import {AuthenticationService} from 'services/authentication.service'
import {buildUser} from 'utilities/authentication'


export default function useUser() {
	const {isPending, data} = useQuery({
		queryKey: ['user'],
		queryFn: AuthenticationService.me
	})

	return {isPending, user: buildUser(data?.data)}
}
