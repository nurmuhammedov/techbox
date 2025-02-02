import {Logout, SelectIcon, Status} from 'assets/icons'
import {useAppContext, useLogout} from 'hooks'
import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'
import classNames from 'classnames'
import {useState} from 'react'


const Index = () => {
	const {t} = useTranslation()
	const [accountIsOpen, setAccountIsOpen] = useState(false)
	const {user} = useAppContext()
	const {handleLogout, isPending} = useLogout()


	return (
		<div className={styles.root}>
			<div className={styles['role-label']}>
				{user?.roleLabel}
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