import {Logo} from 'assets/icons'
import {useAppContext, useSideMenu} from 'hooks'
import {FC, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useLocation, useNavigate} from 'react-router-dom'
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
	const {pathname} = useLocation()
	const [openGroup, setOpenGroup] = useState<string | null>(null)

	useEffect(() => {
		const section = sideMenu?.find(item => item.items && pathname.startsWith(item.href))
		if (section) setOpenGroup(section.id)
	}, [pathname, sideMenu])

	return (
		<aside className={classNames(styles.sidebar, {[styles.collapsed]: isCollapsed})}>
			<div className={styles.header}>
				<div className={styles.logoWrapper} onClick={() => navigate(routeByRole(user?.role, user?.categories))}>
					<Logo/>
					{!isCollapsed && <p>{t('TechBox')}</p>}
				</div>
				<button className={styles.toggleBtn} onClick={onToggle} aria-label={t(isCollapsed ? 'Expand menu' : 'Collapse menu')}>
					{isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
				</button>
			</div>
			
			<ul className={styles.menu}>
				{sideMenu?.map((item) => (
					<li key={item?.id}>
						<SidebarItem
							{...item}
							isCollapsed={isCollapsed}
							isOpen={openGroup === item.id}
							onToggle={() => setOpenGroup(open => open === item.id ? null : item.id)}
						/>
					</li>
				))}
			</ul>
		</aside>
	)
}

export default Index
