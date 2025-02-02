import React, {ReactNode} from 'react'
import styles from './styles.module.scss'
import Sidebar from './Sidebar'
import Header from './Header'


interface IProperties {
	children?: ReactNode
}

const Index: React.FC<IProperties> = ({children}) => {
	return <div className={styles.root}>
		<Sidebar/>
		<div className={styles.main}>
			<Header/>
			<div className={styles.wrapper}>
				{children}
			</div>
		</div>
	</div>
}

export default Index