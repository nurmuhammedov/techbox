import {Button, Modal} from 'components'
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
		removeParams('modal', 'deleteId')
	}

	return (
		<Modal animation="flip" id="delete" style={{height: '20rem'}} onClose={handleClose}>
			<h1 className={styles.title}>{t(title)}</h1>
			<div style={{marginTop: 'auto'}} className="flex items-center gap-lg">
				<Button
					style={{flex: 1}}
					disabled={isPending}
					onClick={() => mutateAsync().then(() => {
						removeParams('modal', 'deleteId')
						onDelete?.()
					})}
				>
					Confirm
				</Button>
			</div>
		</Modal>
	)
}

export default Index