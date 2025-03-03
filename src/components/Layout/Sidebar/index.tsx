import {Logo} from 'assets/icons'
import {ROLE_LIST} from 'constants/roles'
import {useAppContext, useSideMenu} from 'hooks'
import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {routeByRole} from 'utilities/authentication'
import SidebarItem from './SidebarItem'
import styles from './styles.module.scss'


const Index: FC = () => {
	const {t} = useTranslation()
	const {user} = useAppContext()
	const navigate = useNavigate()
	const sideMenu = useSideMenu()

	return (
		<aside className={styles.sidebar}>
			<div className={styles.header} onClick={() => navigate(routeByRole(user?.role))}>
				<Logo/>
				<p>{t('TechBox')}</p>
			</div>
			<ul className={styles.menu}>
				{
					[ROLE_LIST.EMPLOYEE].includes(user?.role || ROLE_LIST.EMPLOYEE) ?
						sideMenu?.filter(item => user?.permissions?.includes(item.id))?.map((item) => (
							<li key={item?.id}>
								<SidebarItem {...item}/>
							</li>
						)) :
						sideMenu?.map((item) => (
							<li key={item?.id}>
								<SidebarItem {...item}/>
							</li>
						))
				}
			</ul>
		</aside>
	)
}

export default Index
