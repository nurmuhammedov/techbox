import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {NavLink, NavLinkRenderProps, useLocation} from 'react-router-dom'
import classNames from 'classnames'
import {IMenuItem} from 'interfaces/configuration.interface'
import styles from './styles.module.scss'

interface SidebarItemProps extends IMenuItem {
	isCollapsed?: boolean;
}

const Index: FC<SidebarItemProps> = ({href, label, icon: Icon, isCollapsed}) => {
	const {t} = useTranslation()
	const location = useLocation()
	const isRootActive = href === '/' && location.pathname === '/'

	return (
		<NavLink
			to={href}
			className={({isActive}: NavLinkRenderProps) => classNames(styles.navItem, {
				[styles.active]: isActive || isRootActive,
				[styles.collapsed]: isCollapsed
			})}
			data-label={t(label)}
		>
			<span className={classNames(styles.icon)}>
				{Icon ? <Icon size={22} strokeWidth={1.5} /> : null}
			</span>
			{!isCollapsed && <span className={styles.title}>{t(label)}</span>}
		</NavLink>
	)
}

export default Index
