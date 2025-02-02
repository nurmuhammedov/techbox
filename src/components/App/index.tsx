import {Layout} from 'components'
import {AppContextProvider} from 'contexts/AppContext'
import {Outlet} from 'react-router-dom'
import {FC} from 'react'


const Index: FC = () => (<AppContextProvider><Layout><Outlet/></Layout></AppContextProvider>)

export default Index