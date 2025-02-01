import {AppContext} from 'contexts/AppContext'
import {useContext} from 'react'


export default function useAppContext() {
	const context = useContext(AppContext)
	if (context === undefined) {
		throw new Error('Hook used out of the AppContextProvider')
	}
	return context
}
