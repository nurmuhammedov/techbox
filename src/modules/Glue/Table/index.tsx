import {Plus} from 'assets/icons'
import {Button, Card, PageTitle, Pagination, ReactTable} from 'components'
import {usePaginatedData, usePagination} from 'hooks'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {Column} from 'react-table'
import {IIDName} from 'interfaces/configuration.interface'


interface IGlue {
	id: number
	glue_type: IIDName
	price: number
	amount: number
	remaining_amount: number
}

const GlueList = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()

	const {data, totalPages, isPending: isLoading} = usePaginatedData<IGlue[]>(
		`chemicals/glues`,
		{page, page_size: pageSize}
	)

	const columns: Column<IGlue>[] = useMemo(
		() => [
			{
				Header: t('№'),
				accessor: (_: IGlue, index: number) => (page - 1) * pageSize + (index + 1),
				style: {width: '3rem', textAlign: 'center'}
			},
			{Header: t('Glue type'), accessor: (row: IGlue) => row.glue_type?.name},
			{Header: t('Price'), accessor: (row: IGlue) => row.price},
			{Header: t('Amount'), accessor: (row: IGlue) => `${row.amount} kg`},
			{Header: t('Remaining amount'), accessor: (row: IGlue) => row.remaining_amount}
			// {
			// 	Header: t('Actions'),
			// 	accessor: (row: IGlue) => (
			// 		<div className="flex gap-lg">
			// 			<EditButton onClick={() => navigate(`edit/${row.id}`)}/>
			// 		</div>
			// 	)
			// }
		],
		[t, page, pageSize]
	)

	return (
		<>
			<PageTitle title={t('Glue')}>
				<Button icon={<Plus/>} onClick={() => navigate(`add`)}>
					{t('Add glue')}
				</Button>
			</PageTitle>
			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>
		</>
	)
}

export default GlueList
