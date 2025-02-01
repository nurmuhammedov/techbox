import styles from './styles.module.scss'
import {FC, ReactNode} from 'react'
import {useTranslation} from 'react-i18next'


interface IProperties {
	children?: ReactNode;
	title: string;
}

const Index: FC<IProperties> = ({children, title}) => {
	const {t} = useTranslation()
	return (
		<div className={styles.root}>
			<h1>{t(title)}</h1>
			{children ?? <div></div>}
		</div>
	)
}

export default Index