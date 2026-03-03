import { Button, Card, EditButton, Pagination, ReactTable, Tab } from 'components'
import { usePaginatedData, usePagination, useSearchParams } from 'hooks'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Column } from 'react-table'
import { getDate } from 'utilities/date'
import { IPallet } from 'interfaces/orders.interface'
import { interceptor } from 'libraries'
import { showMessage } from 'utilities/alert'

const palletStatusTabs = [
    { value: 'new', label: 'Yangi' },
    { value: 'in_proces', label: 'Buyurtmalarim' },
    { value: 'finished', label: 'Tarix' }
]

interface IProps {
    type: 'flex' | 'glue' | 'bet'
}

const OperatorPalletsTable: FC<IProps> = ({ type }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { page, pageSize } = usePagination()
    const { paramsObject: { status_ = 'new' } } = useSearchParams()

    // Determine the query param corresponding to the operator type
    const queryKey = type === 'flex' ? 'flex' : type === 'glue' ? 'glue' : 'bet'

    const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<IPallet[]>(
        'services/pallets',
        {
            page,
            page_size: pageSize,
            status_,
            [queryKey]: queryKey
        }
    )

    const handleAccept = async (id: number) => {
        try {
            await interceptor.get(`services/pallets/manager?pallet_id=${id}`)
            showMessage('Qabul qilindi', 'success')
            refetch()
        } catch (error) {
            console.error(error)
        }
    }

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
                        {status_ === 'new' && (
                            <Button mini={true} onClick={() => handleAccept(row.id)}>
                                Qabul qilish
                            </Button>
                        )}
                        {status_ === 'in_proces' && (
                            <EditButton onClick={() => navigate(`edit/${row.id}`)} />
                        )}
                        {status_ === 'finished' && (
                            <Button mini={true} onClick={() => navigate(`detail/${row.id}`)}>
                                Batafsil
                            </Button>
                        )}
                    </div>
                )
            }
        ],
        [page, pageSize, status_, navigate, t]
    )

    return (
        <>
            <div className="flex align-center justify-between gap-lg" style={{ marginBottom: '.5rem' }}>
                <Tab query="status_" fallbackValue="new" tabs={palletStatusTabs} />
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

export default OperatorPalletsTable
