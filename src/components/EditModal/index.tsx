import {Loader, Modal} from 'components'
import {useSearchParams} from 'hooks'
import {CSSProperties, ReactNode} from 'react'
import classes from './styles.module.scss'


interface IUpdateModalProps {
	children?: ReactNode
	isLoading?: boolean
	title?: string
	style?: CSSProperties
}

const Index = ({title = 'Edit', children, style, isLoading = true}: IUpdateModalProps) => {
	const {removeParams} = useSearchParams()

	const handleClose = () => {
		removeParams('modal', 'updateId')
	}


	return (
		<Modal title={title} animation="flip" id="edit" style={style} onClose={handleClose}>
			{isLoading ? <div className={classes.root}>
				<Loader/>
			</div> : children}
		</Modal>
	)
}

export default Index