import {IFIle} from 'interfaces/form.interface'
import {Button, FileUpLoader, Input} from 'components'
import interceptor from 'libraries/interceptor'
import {useState} from 'react'
import {showMessage} from 'utilities/alert'


type Row = Record<string, any>

export const INSPECTION_CHECKS: {key: string, label: string}[] = [
	{key: 'tyres', label: 'Shinalar holati va bosimi'},
	{key: 'brakes', label: 'Tormoz tizimi'},
	{key: 'lights', label: 'Chiroqlar va burilish ko‘rsatkichlari'},
	{key: 'glass', label: 'Oynalar va tozalagichlar'},
	{key: 'body', label: 'Kuzov va yuk bo‘limi butunligi'},
	{key: 'fuel', label: 'Yoqilg‘i darajasi (kamida 50%)'}
]

const MUTED = {color: '#64748b', fontSize: '.875rem'}

// Pre-trip check of the truck; one item not right means the trip cannot leave
const InspectionForm = ({endpoint, last, onDone}: {endpoint: string, last?: Row | null, onDone: () => void}) => {
	const [checks, setChecks] = useState<Row>(() => Object.fromEntries(INSPECTION_CHECKS.map(c => [c.key, false])))
	const [comment, setComment] = useState('')
	const [photos, setPhotos] = useState<Row[]>([])
	const [busy, setBusy] = useState(false)
	const failed = INSPECTION_CHECKS.filter(c => !checks[c.key])

	const submit = () => {
		if (failed.length && !comment.trim()) return showMessage('Nima joyida emasligini izohda yozing', 'error')
		setBusy(true)
		interceptor.post(endpoint, {checks, comment, photo_ids: photos.map(p => p.id)})
			.then(({data}) => {
				showMessage(data.passed ? 'Tekshiruvdan o‘tdi' : 'Tekshiruvdan o‘tmadi, logistga xabar bering', data.passed ? 'success' : 'error')
				onDone()
			})
			.finally(() => setBusy(false))
	}

	return (
		<div className="flex flex-col gap-md">
			{last && !last.passed && (
				<div style={{background: '#fef2f2', color: '#991b1b', borderRadius: '.5rem', padding: '.75rem 1rem'}}>
					Oxirgi tekshiruvdan o‘tmagan{last.comment ? `: ${last.comment}` : ''}. Kamchilik tuzatilgach, qayta tekshiring.
				</div>
			)}
			<div className="flex flex-col">
				{INSPECTION_CHECKS.map(c => (
					<label key={c.key} className="flex justify-between align-center gap-md"
						style={{padding: '.75rem 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer'}}>
						<span>{c.label}</span>
						<input
							type="checkbox"
							checked={checks[c.key]}
							onChange={(e) => setChecks(v => ({...v, [c.key]: e.target.checked}))}
							style={{width: '1.375rem', height: '1.375rem', accentColor: '#16a34a'}}
						/>
					</label>
				))}
			</div>
			<FileUpLoader id={`inspection_photos_${endpoint}`} url="attachments/create" type="image" multi={true}
				label="Mashina rasmlari" value={photos as IFIle[]} onChange={(v) => setPhotos((v as Row[]) ?? [])}/>
			<Input id={`inspection_comment_${endpoint}`} label={failed.length ? 'Nima joyida emas (majburiy)' : 'Izoh'}
				value={comment} onChange={(e) => setComment(e.target.value)}/>
			<span style={MUTED}>
				{failed.length
					? `Belgilanmagan: ${failed.length} ta band. Bunday holatda reys yo‘lga chiqmaydi.`
					: 'Hammasi joyida, reysni qabul qilishingiz mumkin.'}
			</span>
			<Button disabled={busy} onClick={submit}>Tekshiruvni yakunlash</Button>
		</div>
	)
}

export default InspectionForm
