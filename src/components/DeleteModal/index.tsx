import {Button, Modal} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useDelete, useSearchParams} from 'hooks'
import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'


interface IProperties {
	endpoint: string
	title?: string
	onDelete?: () => void
}

const Index = ({title = 'Should it really be deleted?', endpoint, onDelete}: IProperties) => {
	const {t} = useTranslation()
	const {paramsObject, removeParams} = useSearchParams()
	const {mutateAsync, isPending} = useDelete(endpoint, paramsObject['deleteId'])

	const handleClose = () => {
		removeParams('modal', 'deleteId', 'page', 'limit')
	}

	return (
		<Modal id="delete" style={{height: '20rem'}} onClose={handleClose}>
			<h1 className={styles.title}>{t(title)}</h1>
			<div style={{marginTop: 'auto'}} className="flex items-center gap-lg">
				<Button style={{flex: 1}} type={FIELD.BUTTON} theme={BUTTON_THEME.OUTLINE} onClick={handleClose}>
					Bekor qilish
				</Button>
				<Button
					style={{flex: 1}}
					theme={BUTTON_THEME.DANGER}
					disabled={isPending}
					onClick={() => mutateAsync().then(() => {
						removeParams('modal', 'deleteId', 'page', 'limit')
						onDelete?.()
					})}
				>
					O‘chirish
				</Button>
			</div>
		</Modal>
	)
}

export default Index