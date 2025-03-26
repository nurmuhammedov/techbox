import classNames from 'classnames'
import React from 'react'
import styles from './styles.module.scss'
import {Loader} from 'assets/icons'


interface IProperties {
	screen?: boolean
	background?: boolean
}

const Index: React.FC<IProperties> = ({screen = false, background = false}) => {
	return (
		<div className={classNames(styles.root, {[styles.screen]: screen, [styles.background]: background})}>
			<div className={styles['icon-wrapper']}>
				<span className={styles.icon}>
					<Loader/>
				</span>
			</div>
		</div>
	)
}

export default Index
