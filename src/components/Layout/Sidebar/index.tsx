import {Logo} from 'assets/icons'
import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {useAppContext, useSideMenu} from 'hooks'
import {useNavigate} from 'react-router-dom'
import {routeByRole} from 'utilities/authentication'
import styles from './styles.module.scss'
import SidebarItem from './SidebarItem'


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
