import styles from './styles.module.scss'
import Header from './Header'
import {FC, ReactNode} from 'react'


interface IProperties {
	children?: ReactNode
}

const Index: FC<IProperties> = ({children}) => {
	return (
		<div className={styles.root}>
			<Header/>
			<div className={styles.children}>
				{children}
			</div>
		</div>
	)
}

export default Index
