import {Success, Error, Alert} from 'assets/icons'
import React from 'react'
import styles from './styles.module.scss'
import classNames from 'classnames'
import {useTranslation} from 'react-i18next'


interface IProperties {
	title: string;
	visible: boolean;
	type?: 'success' | 'error' | 'alert'
	onClose?: () => void
}

const Index: React.FC<IProperties> = ({title = '', type = 'success', onClose, visible}) => {
	const {t} = useTranslation()
	return (
		<div
			className={classNames(styles.root, {
				[styles.error]: type === 'error',
				[styles.alert]: type === 'alert',
				[styles.enter]: visible,
				[styles.leave]: !visible
			})}
			onClick={() => onClose?.()}
		>
			<div className={styles.right}></div>
			<div className={styles.inner}>
				{type === 'success' ? <Success/> : type === 'error' ? <Error/> : <Alert/>}
				{title ? <div className={styles.title}>{t(title)}</div> : null}
			</div>
		</div>
	)
}

export default Index