import classNames from 'classnames'
import {FC, ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'


interface IProperties {
	children?: ReactNode,
	className?: string,
}

const Index: FC<IProperties> = ({children, className}) => {
	const {t} = useTranslation()
	return (
		<div className={classNames(className, styles.root)}>
			<p>{t('Recycling')}</p>
			{children ?? null}
		</div>
	)
}

export default Index