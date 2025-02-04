import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {NavLink, NavLinkRenderProps, useLocation} from 'react-router-dom'
import classNames from 'classnames'
import {IMenuItem} from 'interfaces/configuration.interface'
import styles from './styles.module.scss'


const Index: FC<IMenuItem> = ({href, label, icon}) => {
	const {t} = useTranslation()
	const location = useLocation()
	const isRootActive = href === '/' && location.pathname === '/'

	return (
		<NavLink
			to={href}
			className={({isActive}: NavLinkRenderProps) => classNames(styles.navItem, {[styles.active]: isActive || isRootActive})}
		>
			<span className={classNames(styles.icon)}>{icon ? icon() : null}</span>
			<span className={styles.title}>{t(label)}</span>
			<div className={styles.right}></div>
		</NavLink>
	)
}

export default Index
