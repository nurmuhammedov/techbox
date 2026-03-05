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
import { translatePalletStatus } from 'utilities/common'

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

    const getQueryParams = () => {
        const params: any = { page, page_size: pageSize }

        if (status_ === 'new') {
            if (type === 'flex') params.ymo1 = 'ymo1'
            if (type === 'glue') params.ymo2 = 'ymo2'
            if (type === 'bet') params.ymo2 = 'ymo2'
        } else if (status_ === 'in_proces') {
            if (type === 'flex') params.flex = 'flex'
            if (type === 'glue') params.glue = 'glue'
            if (type === 'bet') params.bet = 'bet'
        } else if (status_ === 'finished') {
            if (type === 'flex') params.history_flex = 'history_flex'
            if (type === 'glue') params.history_glue = 'history_glue'
            if (type === 'bet') params.history_bet = 'history_bet'
        }

        return params
    }

    const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<IPallet[]>(
        'services/pallets',
        getQueryParams()
    )

    const handleAccept = async (id: number) => {
        try {
            await interceptor.get(`services/pallets/get-performance/${id}`)
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
                accessor: (row: IPallet) => translatePalletStatus(row.status)
            },
            {
                Header: t('Soni'),
                accessor: (row: IPallet) => row.count
            },
            {
                Header: t('Yakuniy soni'),
                accessor: (row: IPallet) => {
                    if (type === 'flex') return row.pallet_count_after_flex ?? row.end_count ?? '-'
                    if (type === 'glue') return row.pallet_count_after_gluing ?? row.end_count ?? '-'
                    if (type === 'bet') return row.pallet_count_after_bet ?? row.end_count ?? '-'
                    if (type === 'glue') return row.pallet_count_after_glue ?? row.end_count ?? '-'
                    return row.end_count || '-'
                }
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
