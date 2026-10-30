import styles from './styles.module.scss'
import {CSSProperties, FC, ReactNode, useLayoutEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import {useTranslation} from 'react-i18next'


interface IProperties {
	children?: ReactNode;
	title?: string;
	style?: CSSProperties;
}

// Title and page actions live in the top bar, so the table below keeps the height
const Index: FC<IProperties> = ({children, title}) => {
	const {t} = useTranslation()
	const [titleSlot, setTitleSlot] = useState<HTMLElement | null>(null)
	const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null)

	useLayoutEffect(() => {
		setTitleSlot(document.getElementById('page-title-slot'))
		setActionsSlot(document.getElementById('page-actions-slot'))
	}, [])

	const text = title ? t(title) : ''
	const isSectionName = text === titleSlot?.dataset.section

	return (
		<>
			{titleSlot && text && !isSectionName && createPortal(<h1 className={styles.crumb} title={text}>{text}</h1>, titleSlot)}
			{actionsSlot && children ? createPortal(children, actionsSlot) : null}
		</>
	)
}

export default Index
