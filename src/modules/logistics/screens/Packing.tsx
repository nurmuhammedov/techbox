import {FilterInput} from 'components'
import {useSearchParams} from 'hooks'
import {useCallback} from 'react'
import {Link} from 'react-router-dom'
import Crud from '../components/Crud'
import {dateTime, index, money, PACKABLE_STATUSES} from '../helpers'


type Row = Record<string, any>

// Every pallet packed so far, across shipments
const Packing = () => {
	const {paramsObject: {search = ''}} = useSearchParams()

	const columns = useCallback((page: number, size: number) => [
		index(page, size),
		{Header: 'Pallet', accessor: (r: Row) => <b>{r.pallet_number}</b>},
		{Header: 'Shtrixkod', accessor: (r: Row) => r.barcode},
		{
			Header: 'Jo‘natma',
			accessor: (r: Row) => r.shipment
				? <Link to={`/shipments/${r.shipment}`}>{r.shipment_number}</Link>
				: '-'
		},
		{Header: 'Mijoz', accessor: (r: Row) => r.customer_name || '-'},
		{Header: 'Quti soni', accessor: (r: Row) => money(r.box_count)},
		{Header: 'Vazni (kg)', accessor: (r: Row) => money(r.weight)},
		{Header: 'Qadoqlovchi', accessor: (r: Row) => r.packer?.fullname || '-'},
		{Header: 'Vaqti', accessor: (r: Row) => dateTime(r.packaging_time)}
	], [])

	return (
		<Crud
			endpoint="logistics/packagings"
			addLabel="Qadoq qo‘shish"
			columns={columns}
			params={{search: search || undefined}}
			toolbar={<FilterInput id="search" query="search" placeholder="Qidirish"/>}
			canModify={(r) => PACKABLE_STATUSES.includes(r.shipment_status)}
			toForm={(r) => ({...r, packer: r.packer?.id ?? r.packer, packaging_time: r.packaging_time?.slice(0, 16)})}
			fields={[
				{
					name: 'shipment', label: 'Jo‘natma', type: 'select', required: true, span: 6,
					source: {
						endpoint: `logistics/shipments/select?status=${PACKABLE_STATUSES.join(',')}`,
						label: (r) => [r.shipment_number, r.customer_name].filter(Boolean).join(' · ')
					}
				},
				{
					name: 'packer', label: 'Qadoqlovchi', type: 'select', required: true, span: 6,
					source: {endpoint: 'logistics/packers/select', label: (r) => r.label}
				},
				{name: 'box_count', label: 'Quti soni', type: 'number', required: true, span: 4},
				{name: 'weight', label: 'Vazni (kg)', type: 'number', required: true, span: 4},
				{name: 'packaging_time', label: 'Vaqti (bo‘sh qolsa, hozir)', type: 'datetime', span: 4}
			]}
		/>
	)
}

export default Packing
