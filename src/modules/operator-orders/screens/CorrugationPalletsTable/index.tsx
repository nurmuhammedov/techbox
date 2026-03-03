import { Button, Card, Pagination, ReactTable } from 'components'
import { usePaginatedData, usePagination } from 'hooks'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Column } from 'react-table'
import { getDate } from 'utilities/date'
import { IPallet } from 'interfaces/orders.interface'

const Index: FC = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { page, pageSize } = usePagination()

    const { data, totalPages, isPending: isLoading } = usePaginatedData<IPallet[]>(
        'services/pallets',
        {
            page: page,
            page_size: pageSize,
            history_gofra: 'history_gofra'
        }
    )

    const columns: Column<IPallet>[] = useMemo(
        () => [
            {
                Header: t('№'),
                accessor: (_: IPallet, index: number) => (page - 1) * pageSize + (index + 1),
                style: {
                    width: '1.5rem',
                    textAlign: 'center'
                }
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
                Header: t('Soni'),
                accessor: (row: IPallet) => row.count
            },
            {
                Header: t('Yakuniy soni'),
                accessor: (row: IPallet) => row.end_count || '-'
            },
            {
                Header: t('Yak. sana'),
                accessor: (row: IPallet) => row.end_date ? getDate(row.end_date) : '-'
            },
            {
                Header: t('Actions'),
                accessor: (row: IPallet) => (
                    <div className="flex items-start gap-lg">
                        <Button mini={true} onClick={() => navigate(`/corrugation-orders/pallet-detail/${row.id}`)}>
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

export default Index
