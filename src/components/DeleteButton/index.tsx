import {Trash2} from 'lucide-react'
import {useSearchParams} from 'hooks'
import styles from './styles.module.scss'


interface IProperties {
	id: string | number
	withSlash?: boolean
}

const Index = ({id, withSlash = false}: IProperties) => {
	const {addParams} = useSearchParams()
	return (
		<button type="button" aria-label="O‘chirish" title="O‘chirish" className={styles.root} onClick={() => addParams({modal: 'delete', deleteId: withSlash ? `${id}/` : id})}>
			<Trash2 size={18} color="#dc2626"/>
		</button>
	)
}

export default Index