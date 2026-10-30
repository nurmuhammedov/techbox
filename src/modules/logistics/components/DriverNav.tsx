import {AlertTriangle, Home, Receipt, Truck} from 'lucide-react'
import {NavLink} from 'react-router-dom'


const ITEMS = [
	{to: '/driver', label: 'Bosh sahifa', icon: Home, end: true},
	{to: '/driver/trips', label: 'Reyslar', icon: Truck, end: false},
	{to: '/driver/expenses', label: 'Xarajatlar', icon: Receipt, end: false},
	{to: '/driver/incident', label: 'Hodisa', icon: AlertTriangle, end: false}
]

// The driver works from a phone: the main sections sit under the thumb
const DriverNav = () => (
	<>
		<div style={{height: '4.5rem', flexShrink: 0}}/>
		<nav style={{
			position: 'fixed',
			left: 0,
			right: 0,
			bottom: 0,
			display: 'flex',
			background: '#fff',
			borderTop: '1px solid var(--gray-pale)',
			zIndex: 20,
			paddingBottom: 'env(safe-area-inset-bottom)'
		}}>
			{ITEMS.map(item => (
				<NavLink
					key={item.to}
					to={item.to}
					end={item.end}
					style={({isActive}) => ({
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '.2rem',
						padding: '.6rem 0',
						fontSize: '.75rem',
						color: isActive ? '#1d4ed8' : '#64748b',
						fontWeight: isActive ? 600 : 400,
						textDecoration: 'none'
					})}
				>
					<item.icon size={22}/>
					{item.label}
				</NavLink>
			))}
		</nav>
	</>
)

export default DriverNav
