import {Edit} from 'assets/icons'
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
		<div
			className={styles.root}
			onClick={() => onClick ? onClick() : addParams({modal: 'edit', updateId: withSlash ? `${id}/` : id})}
		>
			<Edit/>
		</div>
	)
}

export default Index