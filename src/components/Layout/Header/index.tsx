import {Logout, SelectIcon, Status} from 'assets/icons'
import {Menu} from 'lucide-react'
import {useAppContext, useLogout} from 'hooks'
import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'
import classNames from 'classnames'
import {useState, useMemo} from 'react'
import {useLocation} from 'react-router-dom'
import {activeChild, menu} from 'configurations/menu'


const Index = ({onMenu}: {onMenu: () => void}) => {
	const {t} = useTranslation()
	const [accountIsOpen, setAccountIsOpen] = useState(false)
	const {user} = useAppContext()
	const {handleLogout, isPending} = useLogout()
	const location = useLocation()

	const currentMenu = useMemo(() => {
		// Sort by href length descending to match the most specific path first
		const sortedMenu = [...menu].sort((a, b) => b.href.length - a.href.length)
		return sortedMenu.find(item => {
			if (item.href === '/') return location.pathname === '/'
			return location.pathname.startsWith(item.href)
		})
	}, [location.pathname])
	const currentChild = currentMenu ? activeChild(currentMenu, location.pathname, location.search) : undefined

	return (
		<div className={styles.root}>
			<button type="button" className={styles.menuButton} aria-label={t('Menu')} onClick={onMenu}>
				<Menu size={22}/>
			</button>
			<div className={styles.titleRow}>
				<div className={styles.pageTitle}>
					{t(currentMenu?.label ?? '')}
					{currentChild && <span className={styles.crumb}>{t(currentChild.label)}</span>}
				</div>
				<div id="page-title-slot" className={styles.titleSlot} data-section={t(currentMenu?.label ?? '')}/>
			</div>
			<div id="page-actions-slot" className={styles.actions}/>
			<div className={styles['profile-container']}>
				<div
					role="button"
					tabIndex={0}
					aria-expanded={accountIsOpen}
					onClick={() => setAccountIsOpen(p => !p)}
					onKeyDown={(e) => e.key === 'Enter' && setAccountIsOpen(p => !p)}
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
						role="button"
						tabIndex={accountIsOpen ? 0 : -1}
						className={classNames(styles.logout, {[styles.isLoading]: isPending})}
						onClick={() => handleLogout()}
						onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
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