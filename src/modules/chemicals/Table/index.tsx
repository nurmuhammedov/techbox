import {Button, Card, PageTitle, Pagination, ReactTable} from 'components'
import {usePaginatedData, usePagination} from 'hooks'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'
import {decimalToInteger, decimalToPrice} from 'utilities/common'
import {Plus} from 'assets/icons'
import {useNavigate} from 'react-router-dom'
import {IIDName} from 'interfaces/configuration.interface'


interface IChemical {
	id: number
	chemical_type: IIDName
	price: number
	amount: number
	unity: string
	remaining_amount: number
}

const ChemicalsIndex = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const navigate = useNavigate()

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IChemical[]>(
		'chemicals/chemicals',
		{page, page_size: pageSize}
	)

	const columns: Column<IChemical>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IChemical, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{Header: t('Chemical type'), accessor: (row) => row.chemical_type?.name},
			{Header: t('Price'), accessor: (row) => decimalToPrice(row.price)},
			{Header: `${t('Amount')}`, accessor: (row) => `${decimalToInteger(row.amount)} ${row?.unity || ''}`},
			{Header: `${t('Remaining')}`, accessor: (row) => `${decimalToInteger(row.amount)} ${row?.unity || ''}`}
		],
		[t, page, pageSize]
	)

	return (
		<>
			<PageTitle title={t('Chemicals')}>
				<Button icon={<Plus/>} onClick={() => navigate(`add`)}>Add chemicals</Button>
			</PageTitle>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>
		</>
	)
}

export default ChemicalsIndex
