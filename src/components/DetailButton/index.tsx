import {Info} from 'assets/icons'
import {noop} from 'utilities/common'
import styles from '../DeleteButton/styles.module.scss'


interface IProperties {
	id?: string | number
	withSlash?: boolean
	onClick?: () => void
}

const Index = ({onClick}: IProperties) => {
	return (
		<button
			type="button"
			aria-label="Ko‘rish"
			title="Ko‘rish"
			className={styles.root}
			onClick={() => onClick ? onClick() : noop()}
		>
			<Info/>
		</button>
	)
}

export default Index