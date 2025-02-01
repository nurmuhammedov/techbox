import {createPortal} from 'react-dom'
import {Toaster} from 'react-hot-toast'
import React, {ReactPortal} from 'react'


const Index: React.FC = (): ReactPortal => createPortal(<Toaster/>, document.querySelector('#alert') as HTMLElement)

export default Index