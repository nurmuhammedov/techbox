import {Logo} from 'assets/icons'
import {useAppContext, useSideMenu} from 'hooks'
import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {routeByRole} from 'utilities/authentication'
import SidebarItem from './SidebarItem'
import styles from './styles.module.scss'
import classNames from 'classnames'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
	isCollapsed: boolean;
	onToggle: () => void;
}

const Index: FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
	const {t} = useTranslation()
	const {user} = useAppContext()
	const navigate = useNavigate()
	const sideMenu = useSideMenu()

	return (
		<aside className={classNames(styles.sidebar, {[styles.collapsed]: isCollapsed})}>
			<div className={styles.header}>
				<div className={styles.logoWrapper} onClick={() => navigate(routeByRole(user?.role))}>
					<Logo/>
					{!isCollapsed && <p>{t('TechBox')}</p>}
				</div>
				<button className={styles.toggleBtn} onClick={onToggle}>
					{isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
				</button>
			</div>
			
			<ul className={styles.menu}>
				{sideMenu?.map((item) => (
					<li key={item?.id}>
						<SidebarItem {...item} isCollapsed={isCollapsed} />
					</li>
				))}
			</ul>
		</aside>
	)
}

export default Index
