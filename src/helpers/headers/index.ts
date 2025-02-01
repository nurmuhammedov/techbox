import {TFunction} from 'i18next'
import {IDatabaseItemDetail} from 'interfaces/database.interface'
import {formatDate} from 'utilities/data'


const databaseTableHeader = (t: TFunction<'translation', undefined>, page: number, pageSize: number) => [
	{
		Header: t('№'),
		accessor: (_: IDatabaseItemDetail, index: number) => ((page - 1) * pageSize) + (index + 1),
		style: {
			width: '3rem',
			textAlign: 'center'
		}
	},
	{
		Header: t('Name'),
		accessor: (row: IDatabaseItemDetail) => row.name
	},
	{
		Header: t('Date added'),
		accessor: (row: IDatabaseItemDetail) => formatDate(row.created_at)

	}
]


export {
	databaseTableHeader
}