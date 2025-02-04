import {PropsWithChildren, createContext, useState, useEffect} from 'react'
import {IUser} from 'interfaces/authentication.interface'
import {buildUser} from 'utilities/authentication'
import {noop} from 'utilities/common'
import {interceptor} from 'libraries'
import {Loader} from 'components'


interface IAppContext {
	user: IUser | null,
	setUser: (user: IUser | null) => void,
	setIsLoading: (isLoading: boolean) => void,
}

const AppContext = createContext<IAppContext>({user: null, setUser: noop, setIsLoading: noop})

function AppContextProvider({children}: PropsWithChildren) {
	const [user, setUser] = useState<IUser | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		interceptor
			.get('accounts/me')
			.then(res => {
				setUser(buildUser(res.data))
			})
			.finally(() => {
				setTimeout(() => setIsLoading(false), 1250)
			})
	}, [])

	if (isLoading) {
		return <Loader screen background/>
	}

	return (
		<AppContext.Provider value={{user, setUser, setIsLoading}}>
			{children}
		</AppContext.Provider>
	)
}

export {AppContext, AppContextProvider}
