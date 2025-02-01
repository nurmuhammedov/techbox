import {Edit} from 'assets/icons'
import {useSearchParams} from 'hooks'
import styles from '../DeleteButton/styles.module.scss'


interface IProperties {
	id: string | number
	withSlash?: boolean
}

const Index = ({id, withSlash = false}: IProperties) => {
	const {addParams} = useSearchParams()
	return (
		<div className={styles.root} onClick={() => addParams({modal: 'edit', updateId: withSlash ? `${id}/` : id})}>
			<Edit/>
		</div>
	)
}

export default Index