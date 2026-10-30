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
		<div className={styles.root} style={style} role="tablist">
			{
				tabs?.map(item => {
					return (
						<button
							key={item.value}
							type="button"
							role="tab"
							aria-selected={item.value == status}
							className={classNames(styles.tab, {[styles.active]: item.value == status})}
							onClick={() => handleTabChange(item.value)}
						>
							{t(item.label as string)}
						</button>
					)
				})
			}
		</div>
	)
}

export default Index