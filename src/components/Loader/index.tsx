import React from 'react'
import classNames from 'classnames'
import styles from './styles.module.scss'


interface IProperties {
	screen?: boolean
	background?: boolean
}

const Index: React.FC<IProperties> = ({screen = false, background = false}) => {
	return (
		<div className={classNames(styles.root, {[styles.screen]: screen, [styles.background]: background})}>
			<div className={styles.spinner}></div>
		</div>
	)
}

export default Index