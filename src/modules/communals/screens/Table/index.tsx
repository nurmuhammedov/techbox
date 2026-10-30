import {Plus} from 'assets/icons'
import {
	Button,
	Card,
	DeleteButton,
	DeleteModal,
	EditButton,
	Pagination,
	PageTitle,
	ReactTable
} from 'components'
import {
	usePaginatedData,
	usePagination,
	useSearchParams
} from 'hooks'
import {FC, useMemo, useState, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {ICommunalResource, ICommunalTariff, ICommunalReport, ICommunalUnit} from 'interfaces/communals.interface'
import {currencyOptions, currencySymbols, resourceTypeOptions} from 'helpers/options'
import {decimalToPrice} from 'utilities/common'
import {Calendar, ChevronLeft, ChevronRight} from 'lucide-react'
import Dashboard from './Dashboard'
import classes from './Dashboard.module.scss'

const Index: FC = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()

	const [currentDate, setCurrentDate] = useState<Date>(new Date())
	const [isPickerOpen, setIsPickerOpen] = useState(false)
	const [pickerYear, setPickerYear] = useState<number>(currentDate.getFullYear())
	const pickerRef = useRef<HTMLDivElement>(null)

	const monthsUz = useMemo(() => [
		t('Yanvar'), t('Fevral'), t('Mart'), t('Aprel'), t('May'), t('Iyun'),
		t('Iyul'), t('Avgust'), t('Sentabr'), t('Oktabr'), t('Noyabr'), t('Dekabr')
	], [t])

	const monthsShort = useMemo(() => [
		'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyu',
		'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'
	], [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				setIsPickerOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const {page, pageSize} = usePagination()
	const {paramsObject: {tab = 'dashboard'}} = useSearchParams()

	const endpoint = useMemo(() => {
		if (tab === 'tariffs') return 'communal/tariffs'
		if (tab === 'reports') return 'communal/reports'
		if (tab === 'units') return 'communal/units'
		return 'communal/resources'
	}, [tab])

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<any[]>(
		endpoint,
		{
			page: page,
			page_size: pageSize,
		},
		tab !== 'dashboard'
	)

	const resourceColumns: Column<ICommunalResource>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: ICommunalResource, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{
				Header: t('Name'),
				accessor: (row: ICommunalResource) => row.name
			},
			{
				Header: t('Unit'),
				accessor: (row: ICommunalResource) => row.unit_of_details
					? `${row.unit_of_details.name}${row.unit_of_details.symbol ? ` (${row.unit_of_details.symbol})` : ''}`
					: '-'
			},
			{
				Header: t('Type'),
				accessor: (row: ICommunalResource) =>
					t(resourceTypeOptions.find(item => item.value === row.type)?.label as string || row.type)
			},
			{
				Header: t('Currency'),
				accessor: (row: ICommunalResource) =>
					t(currencyOptions.find(item => item.value === row.currency)?.label as string || row.currency)
			},
			{
				Header: t('Actions'),
				accessor: (row: ICommunalResource) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
						<DeleteButton id={row.id}/>
					</div>
				)
			}
		],
		[t, page, pageSize, navigate]
	)

	const unitColumns: Column<ICommunalUnit>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: ICommunalUnit, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{
				Header: t('Name'),
				accessor: (row: ICommunalUnit) => row.name
			},
			{
				Header: t('Symbol'),
				accessor: (row: ICommunalUnit) => row.symbol || '-'
			},
			{
				Header: t('Actions'),
				accessor: (row: ICommunalUnit) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit-unit/${row.id}`)}/>
						<DeleteButton id={row.id}/>
					</div>
				)
			}
		],
		[t, page, pageSize, navigate]
	)

	const tariffColumns: Column<ICommunalTariff>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: ICommunalTariff, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{
				Header: t('Resource'),
				accessor: (row: ICommunalTariff) => (typeof row.resource === 'object' ? row.resource.name : row.resource)
			},
			{
				Header: t('Oraliq'),
				accessor: (row: ICommunalTariff) => row.from_time || row.to_time
					? `${row.from_time?.slice(0, 5) || ''} - ${row.to_time?.slice(0, 5) || ''}`
					: `${row.from_value ?? 0} - ${row.to_value ?? '∞'}`
			},
			{
				Header: t('Tariff name'),
				accessor: (row: ICommunalTariff) => row.time_range || '-'
			},
			{
				Header: t('Price'),
				accessor: (row: ICommunalTariff) =>
					`${decimalToPrice(row.price)} ${currencySymbols[row.currency] || ''}`
			},
			{
				Header: t('Actions'),
				accessor: (row: ICommunalTariff) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit-tariff/${row.id}`)}/>
						<DeleteButton id={row.id}/>
					</div>
				)
			}
		],
		[t, page, pageSize, navigate]
	)

	const reportColumns: Column<ICommunalReport>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: ICommunalReport, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{
				Header: t('Resource'),
				accessor: (row: ICommunalReport) => (typeof row.resource === 'object' ? row.resource.name : row.resource)
			},
			{
				Header: t('Period'),
				accessor: (row: ICommunalReport) => {
					return (row.month && row.year) ? `${monthsUz[row.month - 1]} ${row.year}` : '-';
				}
			},
			{
				Header: t('Meter value'),
				accessor: (row: ICommunalReport) => row.meter_value ?? '-'
			},
			{
				Header: t('Usage'),
				accessor: (row: ICommunalReport) => {
					if (row.consumption == null) return '-'
					const unit = typeof row.resource === 'object'
						? row.resource.unit_of?.symbol || ''
						: ''
					return unit ? `${row.consumption} ${unit}` : row.consumption
				}
			},
			{
				Header: t('Total price'),
				accessor: (row: ICommunalReport) => decimalToPrice(row.total_price || 0)
			},
			{
				Header: t('Amount paid'),
				accessor: (row: ICommunalReport) => decimalToPrice(row.amount_paid)
			},
			{
				Header: t('Actions'),
				accessor: (row: ICommunalReport) => (
					<div className="flex items-start gap-lg">
						<EditButton onClick={() => navigate(`edit-report/${row.id}`)}/>
						<DeleteButton id={row.id}/>
					</div>
				)
			}
		],
		[t, page, pageSize, navigate, monthsUz]
	)

	const columns = useMemo(() => {
		if (tab === 'tariffs') return tariffColumns as any[]
		if (tab === 'reports') return reportColumns as any[]
		if (tab === 'units') return unitColumns as any[]
		return resourceColumns as any[]
	}, [tab, resourceColumns, unitColumns, tariffColumns, reportColumns])

	if (tab === 'dashboard') {
		return (
			<>
				<div className="flex justify-end items-center" style={{marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
					
					<div className="flex items-center gap-md" style={{ position: 'relative' }} ref={pickerRef}>
						<button 
							className={classes.monthYearTrigger}
							style={{ height: '2.5rem' }}
							onClick={() => {
								setPickerYear(currentDate.getFullYear())
								setIsPickerOpen(!isPickerOpen)
							}}
						>
							<Calendar size={18} />
							<span>{monthsUz[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
						</button>

						{isPickerOpen && (
							<div className={classes.monthDropdown} style={{ right: 0 }}>
								<div className={classes.dropdownHeader}>
									<button 
										type="button" 
										className={classes.yearButton}
										onClick={() => setPickerYear(prev => prev - 1)}
									>
										<ChevronLeft size={16} />
									</button>
									<span className={classes.yearLabel}>{pickerYear}</span>
									<button 
										type="button" 
										className={classes.yearButton}
										onClick={() => setPickerYear(prev => prev + 1)}
									>
										<ChevronRight size={16} />
									</button>
								</div>
								
								<div className={classes.monthsGrid}>
									{monthsShort.map((mName, index) => {
										const isActive = currentDate.getFullYear() === pickerYear && currentDate.getMonth() === index
										return (
											<button
												key={mName}
												type="button"
												className={`${classes.monthButton} ${isActive ? classes.active : ''}`}
												onClick={() => {
													setCurrentDate(new Date(pickerYear, index, 1))
													setIsPickerOpen(false)
												}}
											>
												{mName}
											</button>
										)
									})}
								</div>
							</div>
						)}
					</div>
				</div>
				<Dashboard currentDate={currentDate} />
			</>
		)
	}

	return (
		<>
			<PageTitle>
				<Button icon={<Plus/>} onClick={() => navigate(`add${tab === 'resources' ? '' : `-${(tab as string).slice(0, -1)}`}`)}>
					{t('Add')}
				</Button>
			</PageTitle>
			<Card>
				<ReactTable
					columns={columns}
					data={data}
					isLoading={isLoading}
				/>
			</Card>
			<Pagination totalPages={totalPages}/>
			<DeleteModal endpoint={`${endpoint}/`} onDelete={() => refetch()}/>
		</>
	)
}

export default Index
