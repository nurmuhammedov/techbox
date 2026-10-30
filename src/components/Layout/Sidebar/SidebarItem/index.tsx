import {FC, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Link, NavLink, NavLinkRenderProps, useLocation} from 'react-router-dom'
import classNames from 'classnames'
import {ChevronDown} from 'lucide-react'
import {activeChild} from 'configurations/menu'
import {IMenuItem} from 'interfaces/configuration.interface'
import styles from './styles.module.scss'

interface SidebarItemProps extends IMenuItem {
	isCollapsed?: boolean;
	isOpen?: boolean;
	onToggle?: () => void;
}

const Group: FC<SidebarItemProps> = (item) => {
	const {href, label, icon: Icon, items = [], isCollapsed, isOpen, onToggle} = item
	const {t} = useTranslation()
	const {pathname, search} = useLocation()
	const flyout = useRef<HTMLUListElement>(null)
	const [flyoutTop, setFlyoutTop] = useState(0)
	const inSection = pathname.startsWith(href)
	const current = activeChild(item, pathname, search)
	const currentLink = useRef<HTMLAnchorElement>(null)

	useEffect(() => {
		if (isOpen && !isCollapsed) currentLink.current?.scrollIntoView({block: 'nearest'})
	}, [current, isOpen, isCollapsed])

	const children = items.map(child => (
		<li key={child.href}>
			<Link
				to={child.href}
				ref={child === current ? currentLink : undefined}
				aria-current={child === current ? 'page' : undefined}
				className={classNames(styles.subItem, {[styles.subActive]: child === current})}
			>
				{t(child.label)}
			</Link>
		</li>
	))

	if (isCollapsed) {
		// the panel is fixed so the scrolling menu cannot clip it, and stays inside the screen
		const placeFlyout = (top: number) => {
			const height = flyout.current?.offsetHeight ?? 0
			setFlyoutTop(Math.max(8, Math.min(top, window.innerHeight - height - 8)))
		}
		return (
			<div className={styles.group} onMouseEnter={(e) => placeFlyout(e.currentTarget.getBoundingClientRect().top)}>
				<NavLink
					to={items[0]?.href ?? href}
					aria-label={t(label)}
					className={classNames(styles.navItem, styles.collapsed, styles.noTooltip, {[styles.active]: inSection})}
				>
					<span className={styles.icon}>{Icon ? <Icon size={22} strokeWidth={1.5}/> : null}</span>
				</NavLink>
				<ul ref={flyout} className={styles.flyout} style={{top: flyoutTop}}>
					<li className={styles.flyoutTitle}>{t(label)}</li>
					{children}
				</ul>
			</div>
		)
	}

	return (
		<div className={styles.group}>
			<button
				type="button"
				aria-expanded={isOpen}
				onClick={onToggle}
				className={classNames(styles.navItem, styles.groupButton, {[styles.active]: inSection && !isOpen, [styles.inSection]: inSection})}
			>
				<span className={styles.icon}>{Icon ? <Icon size={22} strokeWidth={1.5}/> : null}</span>
				<span className={styles.title}>{t(label)}</span>
				<ChevronDown size={16} className={classNames(styles.chevron, {[styles.chevronOpen]: isOpen})}/>
			</button>
			{isOpen && <ul className={styles.submenu}>{children}</ul>}
		</div>
	)
}

const Index: FC<SidebarItemProps> = (item) => {
	const {href, label, icon: Icon, isCollapsed, items} = item
	const {t} = useTranslation()
	const location = useLocation()
	const isRootActive = href === '/' && location.pathname === '/'

	if (items?.length) return <Group {...item}/>

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
