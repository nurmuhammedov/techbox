import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'
import {useAppContext, useLogout, useSideMenu} from 'hooks'
import {Logo, Logout, SelectIcon} from 'assets/icons'
import NavItem from './NavItem'
import classNames from 'classnames'
import {useState} from 'react'
import Status from 'assets/icons/Status'


const Index = () => {
	const {t} = useTranslation()
	const sideMenu = useSideMenu()
	const [accountIsOpen, setAccountIsOpen] = useState(false)
	const {user} = useAppContext()
	const {handleLogout, isPending} = useLogout()

	return (
		<div className={styles.root}>
			<div className={styles.logo}>
				<Logo/>
				<span>{t('Erp')}</span>
			</div>

			<div className={styles.nav}>
				{
					sideMenu?.map((item) => (
						<NavItem key={item.id} {...item}/>
					))
				}
			</div>

			<div className={styles['profile-container']}>
				<div
					onClick={() => setAccountIsOpen(p => !p)}
					className={classNames(styles.profile)}
				>
					<div className={styles['status-wrapper']}>
						<div className={styles.status}><Status/></div>
						<div className={styles.name}>{user?.fullName ?? 'Admin'}</div>
					</div>
					<div className={classNames(styles.icon, {[styles['active-icon']]: accountIsOpen})}><SelectIcon/></div>
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