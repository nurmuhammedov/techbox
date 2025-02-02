import {PropsWithChildren, createContext, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {IUser} from 'interfaces/authentication.interface'
import {useUser} from 'hooks'
import {Loader} from 'components'


interface IAppContext {
	user: IUser
}

const AppContext = createContext<IAppContext | undefined>(undefined)

function AppContextProvider({children}: PropsWithChildren) {
	const navigate = useNavigate()
	const {user, isPending} = useUser()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!isPending) {
			if (!user) {
				navigate('/login')
			} else {
				const timer = setTimeout(() => setIsLoading(false), 1250)
				return () => clearTimeout(timer)
			}
		}
	}, [isPending])

	console.log(user)

	if (isPending || isLoading || !user) {
		return <Loader screen background/>
	}

	return (
		<AppContext.Provider value={{user}}>
			{children}
		</AppContext.Provider>
	)
}

export {AppContext, AppContextProvider}
