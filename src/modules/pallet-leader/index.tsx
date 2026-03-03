import { Button, Card, Pagination, ReactTable, Tab } from 'components'
import { usePaginatedData, usePagination, useSearchParams } from 'hooks'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Column } from 'react-table'
import { getDate } from 'utilities/date'
import { IPallet } from 'interfaces/orders.interface'

const palletStatusTabs = [
    { value: '', label: 'Barchasi' },
    { value: 'new', label: 'Yangi' },
    { value: 'in_proces', label: 'Jarayonda' },
    { value: 'finished', label: 'Tarix' }
]

const PalletLeaderTable: FC = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { page, pageSize } = usePagination()
    const { paramsObject: { status_ = '' } } = useSearchParams()

    const { data, totalPages, isPending: isLoading } = usePaginatedData<IPallet[]>(
        'services/pallets',
        {
            page,
            page_size: pageSize,
            ...(status_ ? { status_ } : {})
        }
    )

    const columns: Column<IPallet>[] = useMemo(
        () => [
            {
                Header: t('№'),
                accessor: (_: IPallet, index: number) => (page - 1) * pageSize + (index + 1),
                style: { width: '1.5rem', textAlign: 'center' }
            },
            {
                Header: t('Number'),
                accessor: (row: IPallet) => <div>#{row.id}</div>
            },
            {
                Header: t('Holati'),
                accessor: (row: IPallet) => row.status
            },
            {
                Header: t('Faoliyat'),
                accessor: (row: IPallet) => row.activity
            },
            {
                Header: t('Soni'),
                accessor: (row: IPallet) => row.count
            },
            {
                Header: t('Yakuniy soni'),
                accessor: (row: IPallet) => row.end_count || '-'
            },
            {
                Header: t('Muddati'),
                accessor: (row: IPallet) => row.deadline ? getDate(row.deadline) : '-'
            },
            {
                Header: t('Actions'),
                accessor: (row: IPallet) => (
                    <div className="flex items-start gap-lg">
                        <Button mini={true} onClick={() => navigate(`detail/${row.id}`)}>
                            Batafsil
                        </Button>
                    </div>
                )
            }
        ],
        [page, pageSize, navigate, t]
    )

    return (
        <>
            <div className="flex align-center justify-between gap-lg" style={{ marginBottom: '.5rem' }}>
                <Tab query="status_" fallbackValue="" tabs={palletStatusTabs} />
            </div>
            <Card>
                <ReactTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                />
            </Card>
            <Pagination totalPages={totalPages} />
        </>
    )
}

export default PalletLeaderTable
