import styles from './styles.module.scss'
import {CSSProperties, FC, ReactNode} from 'react'
import {useTranslation} from 'react-i18next'


interface IProperties {
	children?: ReactNode;
	title: string;
	style?: CSSProperties;
}

const Index: FC<IProperties> = ({children, title, style}) => {
	const {t} = useTranslation()
	return (
		<div className={styles.root} style={{marginBottom: '1.5rem', ...style}}>
			<h1>{t(title)}</h1>
			{children ?? <div></div>}
		</div>
	)
}

export default Index