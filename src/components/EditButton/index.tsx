import {Pencil} from 'lucide-react'
import {useSearchParams} from 'hooks'
import styles from '../DeleteButton/styles.module.scss'


interface IProperties {
	id?: string | number
	withSlash?: boolean
	onClick?: () => void
}

const Index = ({id, withSlash = false, onClick}: IProperties) => {
	const {addParams} = useSearchParams()
	return (
		<button
			type="button"
			aria-label="Tahrirlash"
			title="Tahrirlash"
			className={styles.root}
			onClick={() => onClick ? onClick() : addParams({modal: 'edit', updateId: withSlash ? `${id}/` : id})}
		>
			<Pencil size={18} color="#146df3"/>
		</button>
	)
}

export default Index