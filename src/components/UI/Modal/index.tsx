import {HR} from 'components'
import {useSearchParams} from 'hooks'
import {CSSProperties, ReactNode, useEffect, useState, useRef} from 'react'
import FocusLock from 'react-focus-lock'
import {Times} from 'assets/icons'
import {useTranslation} from 'react-i18next'
import MD from 'rodal'
import classes from './styles.module.scss'
import {createPortal} from 'react-dom'
import 'rodal/lib/rodal.css'


const customStyles = {
	maxHeight: '98vh',
	maxWidth: '98vw',
	width: '45rem',
	height: '30rem',
	background: 'transparent',
	boxShadow: 'none'
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

type ResizeDirection = 'right' | 'left' | 'bottom' | 'top' | 'bottom-right'

const Modal = (
	{
		id,
		animation = 'fade',
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
	const modalRef = useRef<HTMLDivElement>(null)

	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

	const [size, setSize] = useState<{ width: number; height: number } | null>(null)
	const [isResizing, setIsResizing] = useState(false)
	const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null)
	const [resizeStart, setResizeStart] = useState({ mouseX: 0, mouseY: 0, w: 0, h: 0, posX: 0, posY: 0 })

	const handleClose = () => {
		if (onClose) {
			onClose()
		} else {
			removeParams(queryParam)
		}
	}

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.button !== 0) return
		e.preventDefault()
		setIsDragging(true)
		setDragStart({
			x: e.clientX - position.x,
			y: e.clientY - position.y
		})
	}

	const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, dir: ResizeDirection) => {
		if (e.button !== 0) return
		e.preventDefault()
		e.stopPropagation() // Drag hodisasini to'xtatish
		
		if (modalRef.current) {
			const rect = modalRef.current.getBoundingClientRect()
			setIsResizing(true)
			setResizeDirection(dir)
			setResizeStart({
				mouseX: e.clientX,
				mouseY: e.clientY,
				w: rect.width,
				h: rect.height,
				posX: position.x,
				posY: position.y
			})
		}
	}

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging) {
				let newX = e.clientX - dragStart.x
				let newY = e.clientY - dragStart.y

				if (modalRef.current) {
					const rect = modalRef.current.getBoundingClientRect()
					const modalWidth = rect.width
					const modalHeight = rect.height

					const windowWidth = window.innerWidth
					const windowHeight = window.innerHeight

					const limitX = Math.max(0, (windowWidth - modalWidth) / 2)
					const limitY = Math.max(0, (windowHeight - modalHeight) / 2)

					newX = Math.max(-limitX, Math.min(limitX, newX))
					newY = Math.max(-limitY, Math.min(limitY, newY))
				}

				setPosition({ x: newX, y: newY })
			}

			if (isResizing && resizeDirection) {
				const deltaX = e.clientX - resizeStart.mouseX
				const deltaY = e.clientY - resizeStart.mouseY

				let newWidth = resizeStart.w
				let newHeight = resizeStart.h
				let newX = resizeStart.posX
				let newY = resizeStart.posY

				const minW = 320
				const minH = 240

				const maxW = window.innerWidth - 20
				const maxH = window.innerHeight - 20

				if (resizeDirection === 'right') {
					newWidth = Math.min(maxW, Math.max(minW, resizeStart.w + deltaX))
					const widthChange = newWidth - resizeStart.w
					newX = resizeStart.posX + widthChange / 2
				}

				if (resizeDirection === 'left') {
					newWidth = Math.min(maxW, Math.max(minW, resizeStart.w - deltaX))
					const widthChange = newWidth - resizeStart.w
					newX = resizeStart.posX - widthChange / 2
				}

				if (resizeDirection === 'bottom') {
					newHeight = Math.min(maxH, Math.max(minH, resizeStart.h + deltaY))
					const heightChange = newHeight - resizeStart.h
					newY = resizeStart.posY + heightChange / 2
				}

				if (resizeDirection === 'top') {
					newHeight = Math.min(maxH, Math.max(minH, resizeStart.h - deltaY))
					const heightChange = newHeight - resizeStart.h
					newY = resizeStart.posY - heightChange / 2
				}

				setSize({ width: newWidth, height: newHeight })
				setPosition({ x: newX, y: newY })
			}
		}

		const handleMouseUp = () => {
			setIsDragging(false)
			setIsResizing(false)
			setResizeDirection(null)
		}

		if (isDragging || isResizing) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, isResizing, dragStart, resizeStart, resizeDirection])

	useEffect(() => {
		if (!visible) {
			const timer = setTimeout(() => {
				setPosition({ x: 0, y: 0 })
				setSize(null)
			}, 300)
			return () => clearTimeout(timer)
		}
	}, [visible])

	useEffect(() => {
		if (!visible) return
		// a select or calendar inside handles Escape first and marks it as used
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !e.defaultPrevented) handleClose()
		}
		window.addEventListener('keydown', closeOnEscape)
		return () => window.removeEventListener('keydown', closeOnEscape)
	}, [visible])

	useEffect(() => {
		const body = document.querySelector('body') as HTMLBodyElement
		if (!visible) {
			body.style.overflow = 'auto'
		} else {
			body.style.overflow = 'hidden'
		}
	}, [visible])

	const activeStyles = {
		...customStyles,
		...style,
		...(size ? { width: `${size.width}px`, height: `${size.height}px` } : {})
	}

	return (
		createPortal(
			<FocusLock autoFocus={true} disabled={!visible}>
				<MD
					visible={visible}
					onClose={() => {}}
					animation={animation}
					customStyles={activeStyles}
					showCloseButton={false}
					closeMaskOnClick={false}
				>
					<div 
						ref={modalRef}
						role="dialog"
						aria-modal="true"
						aria-label={title ? t(title) : undefined}
						className={classes.root}
						style={{
							transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
							transition: isDragging ? 'none' : 'transform 0.15s ease-out',
							cursor: isDragging ? 'grabbing' : 'default',
							boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)'
						}}
					>
						<div 
							className={classes['title-wrapper']}
							onMouseDown={handleMouseDown}
							style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
						>
							{
								title ? <p className={classes.title}>{t(title)}</p> : <div></div>
							}
							<button
								type="button"
								aria-label={t('Close')}
								className={classes.times}
								onClick={handleClose}
							>
								<Times/>
							</button>
						</div>
						<HR/>
						<div className={classes.children}>
							{children}
						</div>
						
						{/* ========================================================
						    RESZING HANDLES (TO'RTTA BORDER VA BURCHAK)
						   ======================================================== */}
						{/* O'ng border */}
						<div 
							onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
							style={{
								position: 'absolute',
								right: '-4px',
								top: 0,
								width: '8px',
								height: '100%',
								cursor: 'e-resize',
								zIndex: 1000
							}}
						/>
						{/* Chap border */}
						<div 
							onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
							style={{
								position: 'absolute',
								left: '-4px',
								top: 0,
								width: '8px',
								height: '100%',
								cursor: 'w-resize',
								zIndex: 1000
							}}
						/>
						{/* Pastki border */}
						<div 
							onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
							style={{
								position: 'absolute',
								bottom: '-4px',
								left: 0,
								width: '100%',
								height: '8px',
								cursor: 's-resize',
								zIndex: 1000
							}}
						/>
						{/* Tepa border */}
						<div 
							onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
							style={{
								position: 'absolute',
								top: '-4px',
								left: 0,
								width: '100%',
								height: '8px',
								cursor: 'n-resize',
								zIndex: 1000
							}}
						/>
					</div>
				</MD>
			</FocusLock>,
			document.getElementById('modal') as HTMLElement
		)
	)
}

export default Modal
