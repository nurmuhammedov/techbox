import {Plus} from 'assets/icons'
import {Button, Card, EditButton, PageTitle, Pagination, ReactTable} from 'components'
import {usePagination} from 'hooks'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'


const fakeData = [
	{
		id: 1,
		full_name: 'John  Doe',
		code: 'C12345',
		phone_number: '+998901234567',
		address: 'region_1',
		balance: 1500.75,
		price_type: {name: 'Retail'},
		currency: {name: 'USD'},
		store: {name: 'Main Store'}
	},
	{
		id: 2,
		full_name: 'Jane Smith',
		code: 'C67890',
		phone_number: '+998931112233',
		address: 'region_2',
		balance: 250.00,
		price_type: {name: 'Wholesale'},
		currency: {name: 'EUR'},
		store: {name: 'Branch Store'}
	},
	{
		id: 3,
		full_name: 'Ali Valiyev',
		code: 'C54321',
		phone_number: '+998991234567',
		address: 'region_3',
		balance: 3400.00,
		price_type: {name: 'VIP'},
		currency: {name: 'UZS'},
		store: {name: 'VIP Store'}
	}
]


const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()


	const columns: Column<any>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_, index: number) => (page - 1) * pageSize + (index + 1),
				style: {
					width: '3rem',
					textAlign: 'center'
				}
			},
			{
				Header: t('Full name'),
				accessor: (row) => row.full_name
			},
			{
				Header: t('Client code'),
				accessor: (row) => row.code
			},
			{
				Header: t('Phone number'),
				accessor: (row) => row.phone_number
			},
			{
				Header: t('Balance'),
				accessor: (row) => row.balance
			},
			{
				Header: t('Store'),
				accessor: (row) => row.store.name
			},
			{
				Header: t('Actions'),
				accessor: (row) => (
					<div className="flex items-start gap-lg">
						<EditButton id={row.id}/>
					</div>
				)
			}
		],
		[t, page, pageSize]
	)


	return (
		<>

			<PageTitle title="Employees">
				<Button icon={<Plus/>}>
					Add employee
				</Button>
			</PageTitle>

			<Card>
				<ReactTable columns={columns} data={fakeData} isLoading={false}/>
			</Card>
			<Pagination totalPages={40}/>
		</>
	)
}

export default Index