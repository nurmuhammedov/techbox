import {ISelectOption} from 'interfaces/form.interface'
import styles from './styles.module.scss'
import {useSearchParams} from 'hooks'
import {CSSProperties, FC} from 'react'
import classNames from 'classnames'
import {useTranslation} from 'react-i18next'


interface IProperties {
	fallbackValue: string | number | boolean
	tabs: ISelectOption[]
	query?: string
	style?: CSSProperties
}

const Index: FC<IProperties> = ({tabs, fallbackValue, query = 'tab', style}) => {
	const {paramsObject, addParams} = useSearchParams()
	const status = paramsObject[query] || fallbackValue
	const {t} = useTranslation()


	const handleTabChange = (value: string | number | boolean) => {
		addParams({[query]: String(value)}, 'updateId', 'deleteId', 'modal', 'page', 'limit')
	}

	return (
		<div className={styles.root} style={style}>
			{
				tabs?.map(item => {
					return (
						<div
							key={item.value}
							className={classNames(styles.tab, {[styles.active]: item.value == status})}
							onClick={() => handleTabChange(item.value)}
						>
							{t(item.label as string)}
						</div>
					)
				})
			}
		</div>
	)
}

export default Index