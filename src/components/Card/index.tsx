import classNames from 'classnames'
import styles from './styles.module.scss'
import {FC, ReactNode} from 'react'


interface IProperties {
	children?: ReactNode;
	screen?: boolean;
	className?: string;
	shadow?: boolean;
}

const Index: FC<IProperties> = ({children, screen = false, shadow = true, className = ''}) => {
	return (
		<div className={classNames(styles.root, className, {[styles.screen]: screen, [styles.shadow]: shadow})}>
			{children ?? null}
		</div>
	)
}

export default Index