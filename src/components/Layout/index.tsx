import styles from './styles.module.scss'
import {Outlet} from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import React, {useState, useEffect} from 'react'
import classNames from 'classnames'


const Index: React.FC = () => {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		const saved = localStorage.getItem('sidebar-collapsed')
		return saved === 'true'
	})

	useEffect(() => {
		localStorage.setItem('sidebar-collapsed', String(isCollapsed))
	}, [isCollapsed])

	const toggleSidebar = () => setIsCollapsed(!isCollapsed)

	return (
		<div className={classNames(styles.root, {[styles.collapsed]: isCollapsed})}>
			<Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
			<div className={styles.main}>
				<Header/>
				<div className={styles.wrapper}>
					<Outlet/>
				</div>
			</div>
		</div>
	)
}

export default Index