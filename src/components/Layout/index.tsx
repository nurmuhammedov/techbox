import styles from './styles.module.scss'
import {Outlet} from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import React from 'react'


const Index: React.FC = () => {
	return <div className={styles.root}>
		<Sidebar/>
		<div className={styles.main}>
			<Header/>
			<div className={styles.wrapper}>
				<Outlet/>
			</div>
		</div>
	</div>
}

export default Index