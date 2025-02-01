import {AdminLayout} from 'components'
import {AppContextProvider} from 'contexts/AppContext'
import {Outlet} from 'react-router-dom'
import {FC} from 'react'


const Index: FC = () => (<AppContextProvider><AdminLayout><Outlet/></AdminLayout></AppContextProvider>)

export default Index