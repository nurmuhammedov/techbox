import styles from './styles.module.scss'
import {Outlet} from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import React, {useState, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import classNames from 'classnames'


const phone = window.matchMedia('(max-width: 768px)')

const Index: React.FC = () => {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		const saved = localStorage.getItem('sidebar-collapsed')
		return saved === 'true'
	})

	useEffect(() => {
		localStorage.setItem('sidebar-collapsed', String(isCollapsed))
	}, [isCollapsed])

	const toggleSidebar = () => setIsCollapsed(!isCollapsed)

	const {pathname, search} = useLocation()
	const [isPhone, setIsPhone] = useState(() => phone.matches)
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	useEffect(() => {
		const update = () => setIsPhone(phone.matches)
		phone.addEventListener('change', update)
		return () => phone.removeEventListener('change', update)
	}, [])

	useEffect(() => setIsMenuOpen(false), [pathname, search])

	return (
		<div className={classNames(styles.root, {[styles.collapsed]: isCollapsed && !isPhone, [styles.menuOpen]: isMenuOpen})}>
			<Sidebar
				isCollapsed={isCollapsed && !isPhone}
				onToggle={isPhone ? () => setIsMenuOpen(false) : toggleSidebar}
			/>
			{isMenuOpen && <div className={styles.backdrop} onClick={() => setIsMenuOpen(false)}/>}
			<div className={styles.main}>
				<Header onMenu={() => setIsMenuOpen(true)}/>
				<div className={styles.wrapper}>
					<Outlet/>
				</div>
			</div>
		</div>
	)
}

export default Index