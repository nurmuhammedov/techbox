import {HR} from 'components'
import {useSearchParams} from 'hooks'
import {CSSProperties, ReactNode, useEffect} from 'react'
import FocusLock from 'react-focus-lock'
import {Times} from 'assets/icons'
import {useTranslation} from 'react-i18next'
import MD from 'rodal'
import {noop} from 'utilities/common'
import classes from './styles.module.scss'
import {createPortal} from 'react-dom'
import 'rodal/lib/rodal.css'


const customStyles = {
	maxHeight: '98vh',
	maxWidth: '98vw',
	width: '40rem',
	height: '30rem'
}

interface IProperties {
	animation?: 'zoom' | 'fade' | 'flip' | 'door' | 'rotate' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight'
	id: string
	queryParam?: string
	title?: string
	children?: ReactNode
	onClose?: () => void
	style?: CSSProperties
}

const Modal = (
	{
		id,
		animation = 'flip',
		queryParam = 'modal',
		title = '',
		children,
		onClose,
		style
	}: IProperties
) => {
	const {paramsObject, removeParams} = useSearchParams()
	const {t} = useTranslation()
	const visible = id === paramsObject[queryParam]

	useEffect(() => {
		const body = document.querySelector('body') as HTMLBodyElement
		if (!visible) {
			body.style.overflow = 'auto'
		} else {
			body.style.overflow = 'hidden'
		}
	}, [visible])

	return (
		createPortal(
			<FocusLock autoFocus={true} disabled={!visible}>
				<MD
					visible={visible}
					onClose={noop}
					animation={animation}
					customStyles={{...customStyles, ...style}}
					showCloseButton={false}
					closeMaskOnClick={false}
				>
					<div className={classes.root}>
						<div className={classes['title-wrapper']}>
							{
								title ? <p className={classes.title}>{t(title)}</p> : <div></div>
							}
							<button
								className={classes.times}
								onClick={() => {
									if (onClose) {
										onClose()
									} else {
										removeParams(queryParam)
									}
								}}
							>
								<Times/>
							</button>
						</div>
						<HR/>
						<div className={classes.children}>
							{children}
						</div>
					</div>
				</MD>
			</FocusLock>,
			document.getElementById('modal') as HTMLElement
		)
	)
}

export default Modal
