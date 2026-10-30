import {useEffect, useRef} from 'react'


interface IProperties {
	onChange: (dataUrl: string | null) => void
}

// Signature drawn with a finger or the mouse, handed over as a PNG data URL
const SignaturePad = ({onChange}: IProperties) => {
	const canvas = useRef<HTMLCanvasElement>(null)
	const drawing = useRef(false)
	const signed = useRef(false)

	useEffect(() => {
		const c = canvas.current
		if (!c) return
		c.width = c.offsetWidth
		c.height = c.offsetHeight
		const ctx = c.getContext('2d')!
		ctx.lineWidth = 2
		ctx.lineCap = 'round'
		ctx.strokeStyle = '#1e3a8a'
	}, [])

	const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const rect = canvas.current!.getBoundingClientRect()
		return {x: e.clientX - rect.left, y: e.clientY - rect.top}
	}

	const clear = () => {
		const c = canvas.current!
		c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
		signed.current = false
		onChange(null)
	}

	return (
		<div className="flex flex-col gap-sm">
			<canvas
				ref={canvas}
				style={{width: '100%', height: '16rem', border: '1px dashed #94a3b8', borderRadius: '.8rem', touchAction: 'none', background: '#fff'}}
				onPointerDown={(e) => {
					drawing.current = true
					const ctx = canvas.current!.getContext('2d')!
					const p = point(e)
					ctx.beginPath()
					ctx.moveTo(p.x, p.y)
				}}
				onPointerMove={(e) => {
					if (!drawing.current) return
					const ctx = canvas.current!.getContext('2d')!
					const p = point(e)
					ctx.lineTo(p.x, p.y)
					ctx.stroke()
					signed.current = true
				}}
				onPointerUp={() => {
					drawing.current = false
					if (signed.current) onChange(canvas.current!.toDataURL('image/png'))
				}}
				onPointerLeave={() => {
					if (drawing.current && signed.current) onChange(canvas.current!.toDataURL('image/png'))
					drawing.current = false
				}}
			/>
			<div className="flex justify-between" style={{fontSize: '.85em', color: '#64748b'}}>
				<span>Haydovchi shu yerga imzo chekadi</span>
				<a style={{cursor: 'pointer'}} onClick={clear}>Tozalash</a>
			</div>
		</div>
	)
}

export default SignaturePad
