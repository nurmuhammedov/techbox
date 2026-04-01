import {
    Button,
    Card,
    EditModal,
    Form,
    NumberFormattedInput,
    Pagination,
    ReactTable,
    Select,
    Tab
} from 'components'
import { BUTTON_THEME, FIELD } from 'constants/fields'
import { soldSchema } from 'helpers/yup'
import { useAdd, useData, useDetail, usePaginatedData, usePagination, useSearchParams } from 'hooks'
import { FC, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Column } from 'react-table'
import { getDate } from 'utilities/date'
import { decimalToInteger, decimalToPrice, getSelectValue, translatePalletStatus } from 'utilities/common'
import { IPallet } from 'interfaces/orders.interface'
import { yupResolver } from '@hookform/resolvers/yup'
import { ISelectOption } from 'interfaces/form.interface'

const palletStatusTabs = [
    { value: '', label: 'Barchasi' },
    { value: 'new', label: 'Yangi' },
    { value: 'in_proces', label: 'Jarayonda' },
    { value: 'finished', label: 'Tarix' },
    { value: 'sold', label: 'Sotilganlar' }
]

const PalletLeaderTable: FC = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { page, pageSize } = usePagination()
    const { paramsObject: { status_ = '', updateId = undefined }, removeParams, addParams } = useSearchParams()

    const { data: customers = [] } = useData<ISelectOption[]>('services/customers/select')

    const { data, totalPages, isPending: isLoading, refetch } = usePaginatedData<any[]>(
        status_ === 'sold' ? 'services/sold-pallets/' : 'services/pallets',
        {
            page,
            page_size: pageSize,
            ...(status_ && status_ !== 'sold' ? { status_ } : {})
        }
    )

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(soldSchema),
        mode: 'onTouched',
        defaultValues: {
            customer: undefined,
            price: '',
            money_paid: '',
            count: ''
        }
    })

    const {
        mutateAsync: add,
        isPending: isAdding
    } = useAdd('services/sold-pallets/')

    const {
        data: palletDetail,
        isPending: isPalletDetailLoading
    } = useDetail<IPallet>('services/pallets/', updateId, !!updateId && status_ === 'finished')

    useEffect(() => {
        if (palletDetail && !isPalletDetailLoading) {
            reset({
                count: String(palletDetail?.end_count || palletDetail?.count || 0),
                price: '',
                customer: undefined,
                money_paid: ''
            })
        }
    }, [palletDetail, isPalletDetailLoading, reset])

    const columns: Column<any>[] = useMemo(
        () => [
            {
                Header: t('№'),
                accessor: (_: any, index: number) => (page - 1) * pageSize + (index + 1),
                style: { width: '1.5rem', textAlign: 'center' }
            },
            {
                Header: t('Number'),
                accessor: (row: any) => <div>#{row.id}</div>
            },
            {
                Header: t('Holati'),
                accessor: (row: any) => translatePalletStatus(row.status)
            },
            {
                Header: t('Soni'),
                accessor: (row: any) => decimalToInteger(row.count)
            },
            {
                Header: t('Yakuniy soni'),
                accessor: (row: any) => row.end_count ? decimalToInteger(row.end_count) : '-'
            },
            {
                Header: t('Muddati'),
                accessor: (row: any) => row.deadline ? getDate(row.deadline) : '-'
            },
            {
                Header: t('Actions'),
                accessor: (row: any) => (
                    <div className="flex items-start gap-lg">
                        <Button mini={true} onClick={() => navigate(`detail/${row.id}`)}>
                            Batafsil
                        </Button>
                        {status_ === 'finished' && (
                            <Button mini={true} onClick={() => addParams({ modal: 'edit', updateId: row.id })}>
                                Sotish
                            </Button>
                        )}
                    </div>
                )
            }
        ],
        [page, pageSize, navigate, t, status_, addParams]
    )

    const soldColumns: Column<any>[] = useMemo(
        () => [
            {
                Header: t('№'),
                accessor: (_: any, index: number) => (page - 1) * pageSize + (index + 1),
                style: { width: '3rem', textAlign: 'center' }
            },
            {
                Header: t('Paddon raqami'),
                accessor: (row: any) => `#${row.pallet?.id || row.id}`
            },
            {
                Header: t('Company name'),
                accessor: (row: any) => row.customer?.company_name || '-'
            },
            {
                Header: t('Soni'),
                accessor: (row: any) => decimalToInteger(row.count)
            },
            {
                Header: t('Price'),
                accessor: (row: any) => decimalToPrice(row.price)
            },
            {
                Header: t('Total paid money'),
                accessor: (row: any) => decimalToPrice(row.money_paid)
            },
            // {
            //     Header: t('Yakunlangan sana'),
            //     accessor: (row: any) => row.pallet?.end_date ? getDate(row.pallet.end_date) : '-'
            // },
            {
                Header: t('Sotilgan sana'),
                accessor: (row: any) => row.created_at ? getDate(row.created_at) : '-'
            }
        ],
        [page, pageSize, t]
    )

    return (
        <>
            <div className="flex align-center justify-between gap-lg" style={{ marginBottom: '.5rem' }}>
                <Tab query="status_" fallbackValue="" tabs={palletStatusTabs} />
            </div>
            <Card>
                <ReactTable
                    columns={status_ === 'sold' ? soldColumns : columns}
                    data={data}
                    isLoading={isLoading}
                />
            </Card>
            <Pagination totalPages={totalPages} />

            <EditModal
                title={`#${updateId} - ${t('Sell pallet')?.toLowerCase()}`}
                style={{ height: '40rem', width: '50rem' }}
                isLoading={isPalletDetailLoading}
            >
                <Form onSubmit={(e) => e.preventDefault()}>
                    <div className="span-4">
                        <Controller
                            name="customer"
                            control={control}
                            render={({ field: { value, ref, onChange, onBlur } }) => (
                                <Select
                                    id="customer"
                                    label="Company name"
                                    options={customers}
                                    error={errors?.customer?.message}
                                    value={getSelectValue(customers, value)}
                                    ref={ref}
                                    onBlur={onBlur}
                                    defaultValue={getSelectValue(customers, value)}
                                    handleOnChange={(e) => onChange(e as string)}
                                />
                            )}
                        />
                    </div>

                    <div className="span-12 grid gap-xl flex-0">
                        <div className="span-4">
                            <Controller
                                name="count"
                                control={control}
                                render={({ field }) => (
                                    <NumberFormattedInput
                                        id="count"
                                        maxLength={6}
                                        disableGroupSeparators={false}
                                        allowDecimals={false}
                                        label="Count"
                                        error={errors?.count?.message}
                                        {...field}
                                    />
                                )}
                            />
                        </div>

                        <div className="span-4">
                            <Controller
                                name="price"
                                control={control}
                                render={({ field }) => (
                                    <NumberFormattedInput
                                        id="price"
                                        maxLength={13}
                                        disableGroupSeparators={false}
                                        allowDecimals={true}
                                        label={`${t('Price')} (${t('Item')?.toLowerCase()})`}
                                        error={errors?.price?.message}
                                        {...field}
                                    />
                                )}
                            />
                        </div>

                        <div className="span-4">
                            <Controller
                                name="money_paid"
                                control={control}
                                render={({ field }) => (
                                    <NumberFormattedInput
                                        id="money_paid"
                                        maxLength={13}
                                        disableGroupSeparators={false}
                                        allowDecimals={true}
                                        label="Total paid money"
                                        error={errors?.money_paid?.message}
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </Form>

                <Button
                    type={FIELD.BUTTON}
                    theme={BUTTON_THEME.PRIMARY}
                    disabled={isAdding}
                    onClick={() => {
                        handleSubmit((formData) =>
                            add({ ...formData, count: Number(formData?.count), pallet: updateId })
                                .then(async () => {
                                    reset({
                                        customer: undefined,
                                        price: '',
                                        money_paid: '',
                                        count: ''
                                    })
                                    await refetch()
                                    removeParams('modal', 'updateId')
                                })
                        )()
                    }}
                >
                    Save
                </Button>
            </EditModal>
        </>
    )
}

export default PalletLeaderTable
