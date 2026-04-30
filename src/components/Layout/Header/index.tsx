import {Logout, SelectIcon, Status} from 'assets/icons'
import {useAppContext, useLogout, useSideMenu} from 'hooks'
import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'
import classNames from 'classnames'
import {useState, useMemo} from 'react'
import {useLocation} from 'react-router-dom'


const Index = () => {
	const {t} = useTranslation()
	const [accountIsOpen, setAccountIsOpen] = useState(false)
	const {user} = useAppContext()
	const {handleLogout, isPending} = useLogout()
	const location = useLocation()
	const sideMenu = useSideMenu()

	const currentMenuLabel = useMemo(() => {
		// Sort by href length descending to match the most specific path first
		const sortedMenu = [...(sideMenu || [])].sort((a, b) => b.href.length - a.href.length)
		const match = sortedMenu.find(item => {
			if (item.href === '/') return location.pathname === '/'
			return location.pathname.startsWith(item.href)
		})
		return match ? match.label : ''
	}, [location.pathname, sideMenu])

	return (
		<div className={styles.root}>
			<div className={styles.pageTitle}>
				{t(currentMenuLabel)}
			</div>
			<div className={styles['profile-container']}>
				<div
					onClick={() => setAccountIsOpen(p => !p)}
					className={classNames(styles.profile)}
				>
					<div className={styles['status-wrapper']}>
						<div className={styles.status}><Status/></div>
						<div className={styles.userInfo}>
							<div className={styles.name}>{user?.fullName ?? 'Admin'}</div>
							<div className={styles.role}>{t(user?.roleLabel ?? 'Employee')}</div>
						</div>
					</div>
					<div className={classNames(styles.icon, {[styles['active-icon']]: accountIsOpen})}><SelectIcon/>
					</div>
				</div>
				<div className={classNames(styles.account, {[styles['active-account']]: accountIsOpen})}>
					<div
						className={classNames(styles.logout, {[styles.isLoading]: isPending})}
						onClick={() => handleLogout()}
					>
						<Logout/>
						<span>{t('Logout')}</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Index