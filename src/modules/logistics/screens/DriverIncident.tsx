import {IFIle} from 'interfaces/form.interface'
import {Button, FileUpLoader, Input} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {usePaginatedData} from 'hooks'
import interceptor from 'libraries/interceptor'
import {AlertTriangle, CarFront, CircleHelp, Disc, TrafficCone} from 'lucide-react'
import {useEffect, useState} from 'react'
import {showMessage} from 'utilities/alert'
import DriverNav from '../components/DriverNav'
import {Badge, currentPosition, dateTime, INCIDENT_COLORS, PAGE_BODY} from '../helpers'


type Row = Record<string, any>

const CARD = {padding: '1rem 1.25rem', background: '#fff', border: '1px solid var(--gray-pale)', borderRadius: '.75rem'}
const MUTED = {color: '#64748b', fontSize: '.875rem'}

const TYPES = [
	{value: 'breakdown', label: 'Mashina buzilishi', icon: CarFront},
	{value: 'accident', label: 'Avariya (YTH)', icon: AlertTriangle},
	{value: 'tire_puncture', label: 'Shina teshilishi', icon: Disc},
	{value: 'traffic', label: 'Tirbandlik', icon: TrafficCone},
	{value: 'other', label: 'Boshqa sabab', icon: CircleHelp}
]

// The driver reports a problem on the road; a breakdown or accident takes the truck out of service
const DriverIncident = () => {
	const {data, refetch} = usePaginatedData<Row[]>('logistics/driver/incidents', {page: 1, page_size: 10})
	const [type, setType] = useState<string>('breakdown')
	const [description, setDescription] = useState('')
	const [photos, setPhotos] = useState<Row[]>([])
	const [position, setPosition] = useState<{latitude: number | null, longitude: number | null}>({latitude: null, longitude: null})
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		currentPosition().then(setPosition)
	}, [])

	const submit = () => {
		if (!description.trim()) return showMessage('Nima bo‘lganini yozing', 'error')
		setBusy(true)
		interceptor.post('logistics/driver/incidents', {
			incident_type: type,
			description: description.trim(),
			latitude: position.latitude,
			longitude: position.longitude,
			photo_ids: photos.map(p => p.id)
		})
			.then(() => {
				showMessage('Xabar yuborildi, logist ko‘radi', 'success')
				setDescription('')
				setPhotos([])
				refetch()
			})
			.finally(() => setBusy(false))
	}

	const reports: Row[] = (data as Row[]) ?? []
	return (
		<div className="flex flex-col gap-md" style={PAGE_BODY}>
			<div className="flex flex-col gap-md" style={CARD}>
				<b>Hodisa turi</b>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8.5rem, 1fr))', gap: '.5rem'}}>
					{TYPES.map(t => (
						<button key={t.value} type="button" onClick={() => setType(t.value)} style={{
							display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', padding: '.75rem .5rem',
							borderRadius: '.625rem', font: 'inherit', fontSize: '.875rem', cursor: 'pointer',
							border: `1.5px solid ${type === t.value ? '#2563eb' : 'var(--gray-pale)'}`,
							background: type === t.value ? '#eff6ff' : '#fff', color: type === t.value ? '#1d4ed8' : '#334155'
						}}>
							<t.icon size={22}/>
							{t.label}
						</button>
					))}
				</div>
				<div className="flex justify-between" style={MUTED}>
					<span>Joylashuv</span>
					<span>{position.latitude != null ? `${position.latitude.toFixed(4)}, ${position.longitude?.toFixed(4)}` : 'aniqlanmadi'}</span>
				</div>
				<FileUpLoader id="incident_photos" url="attachments/create" type="image" multi={true} label="Rasmlar"
					value={photos as IFIle[]} onChange={(v) => setPhotos((v as Row[]) ?? [])}/>
				<Input id="incident_description" label="Nima bo‘ldi" placeholder="Hodisa sababi va tafsilotlarini yozing"
					value={description} onChange={(e) => setDescription(e.target.value)}/>
				<Button type={FIELD.BUTTON} theme={BUTTON_THEME.DANGER} disabled={busy} onClick={submit}>Yuborish</Button>
			</div>

			{reports.length > 0 && <b>Mening xabarlarim</b>}
			{reports.map(r => (
				<div key={r.id} className="flex flex-col gap-sm" style={CARD}>
					<div className="flex justify-between align-center gap-md">
						<b>{r.incident_type_display}</b>
						<Badge label={r.status_display} color={INCIDENT_COLORS[r.status] ?? '#475569'}/>
					</div>
					<span>{r.description}</span>
					<span style={MUTED}>{[dateTime(r.incident_date), r.plate_number, r.location].filter(Boolean).join(' · ')}</span>
				</div>
			))}
			<DriverNav/>
		</div>
	)
}

export default DriverIncident
