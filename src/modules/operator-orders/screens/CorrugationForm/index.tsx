import { yupResolver } from '@hookform/resolvers/yup'
import { Corrugation } from 'assets/icons'
import {
    Button,
    Card,
    Diagram,
    Form,
    Input,
    MaskInput,
    NumberFormattedInput,
    PageIcon,
    PageTitle,
    Select
} from 'components'
import OrderInfo from 'components/OrderInfo'
import { BUTTON_THEME } from 'constants/fields'
import { activityOptions, booleanOptions } from 'helpers/options'
import { useDetail, useUpdate } from 'hooks'
import { ISelectOption } from 'interfaces/form.interface'
import { IGroupOrder } from 'interfaces/groupOrders.interface'
import { FC, useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { decimalToInteger, getSelectValue, noop } from 'utilities/common'
import { getDate } from 'utilities/date'
import { showMessage } from 'utilities/alert'
import * as yup from 'yup'
import { IIDName } from 'interfaces/configuration.interface'


interface IDetailData {
    id: number
    group_order: IGroupOrder[]
    warehouse?: number
    glue?: number
    glue_amount?: number
    materials?: (IIDName & { weight?: number | string })[]
}

interface ICorrugationProperties {
    detail?: boolean
}

interface IFormOrder {
    order_id: number
    count: string
}

interface IFormItem {
    id: number
    has_addition: boolean
    format: number | string
    pallet: string
    orders: IFormOrder[]
}

interface ILeftoverItem {
    id: number
    weight: string
}

interface IFormValues {
    items: IFormItem[]
    leftover: ILeftoverItem[]
}

const schema = yup.object().shape({
    items: yup.array().of(
        yup.object().shape({
            id: yup.number().required(),
            has_addition: yup.boolean(),
            pallet: yup.string().when('has_addition', {
                is: true,
                then: (schema) => schema.required('This field is required'),
                otherwise: (schema) => schema.notRequired()
            }),
            orders: yup.array().of(
                yup.object().shape({
                    order_id: yup.number().required(),
                    count: yup.string().required('This field is required')
                })
            )
        })
    ),
    leftover: yup.array().of(
        yup.object().shape({
            id: yup.number().required('This field is required'),
            weight: yup.string().required('This field is required')
        })
    )
})

const CorrugationOrder: FC<ICorrugationProperties> = ({ detail = false }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()

    const { data: responseData } = useDetail<IDetailData>('services/consecutive-orders/', id)

    const {
        mutateAsync: updateOrders,
        isPending: isPendingOrders
    } = useUpdate('services/consecutive-orders/', id, 'patch', '')
    // const {
    //     mutateAsync: updateWeights,
    //     isPending: isPendingWeights
    // } = useUpdate('products/', 'base-material-update-weight', 'put', '')

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<IFormValues>({
        mode: 'onTouched',
        defaultValues: {
            items: [],
            leftover: []
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        resolver: yupResolver(schema)
    })

    const { fields: itemFields } = useFieldArray({
        control,
        name: 'items'
    })

    const { fields: leftoverFields } = useFieldArray({
        control,
        name: 'leftover'
    })

    useEffect(() => {
        if (responseData?.group_order) {
            const mappedItems: IFormItem[] = responseData.group_order.map((groupOrder) => ({
                id: groupOrder.id,
                has_addition: !!groupOrder.has_addition,
                format: groupOrder.separated_raw_materials_format?.format || 0,
                pallet: String(groupOrder.pallet_count_after_gofra || '0'),
                orders: groupOrder.orders.map((order) => ({
                    order_id: order.id,
                    count: String(order.count_after_processing || '')
                }))
            }))

            const uniqueMaterialIds = new Set<number>()

            responseData.group_order.forEach(group => {
                group.orders.forEach(order => {
                    order.layer?.forEach(layerId => {
                        uniqueMaterialIds.add(Number(layerId))
                    })
                })
            })

            const mappedLeftovers: ILeftoverItem[] = responseData?.materials?.map(matId => ({
                id: matId?.id,
                weight: matId?.weight ? String(matId.weight) : ''
            })) || []

            reset({
                items: mappedItems,
                leftover: mappedLeftovers
            })
        }
    }, [responseData, reset])

    const onSubmit = async (data: IFormValues) => {
        const countAfterProcessing: { order: number, count: string }[] = []
        const countAfterGofra: { group_order: number, count: string }[] = []

        data.items.forEach((item) => {
            item.orders.forEach((order) => {
                countAfterProcessing.push({
                    order: order.order_id,
                    count: order.count
                })
            })

            if (item.has_addition) {
                countAfterGofra.push({
                    group_order: item.id,
                    count: item.pallet
                })
            }
        })


        const leftoverPayload = data.leftover
            .filter(item => item.weight && Number(item.weight) > 0)
            .map(item => ({
                id: Number(item.id),
                weight: Number(item.weight)
            }))

        const mainPayload = {
            count_after_processing: countAfterProcessing,
            count_after_gofra: countAfterGofra,
            base_materials: leftoverPayload
        }

        try {
            const promises = []
            promises.push(updateOrders(mainPayload))
            //
            // if (leftoverPayload.length > 0) {
            //     promises.push(updateWeights(leftoverPayload))
            // }

            await Promise.all(promises)
            showMessage(t('Updated successfully'), 'success')
            navigate(-1)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <PageTitle title="Send order">
                <div className="flex gap-sm justify-center align-center">
                    <Button
                        onClick={() => navigate(-1)}
                        theme={BUTTON_THEME.OUTLINE}
                    >
                        Back
                    </Button>
                    {
                        !detail &&
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isPendingOrders}
                        >
                            Send
                        </Button>
                    }
                </div>
            </PageTitle>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '.5rem',
                    gap: '1rem',
                    maxWidth: '100%',
                    width: '100%'
                }}
            >
                <Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>

                    {leftoverFields.length > 0 && (
                        <Card className="span-12" screen={false} style={{ padding: '1.5rem' }}>
                            <div className="grid gap-lg span-12">
                                {leftoverFields.map((field, index) => {
                                    const materialLabel = `${responseData?.materials?.find(m => m.id == watch(`leftover.${index}.id`))?.material_name || '-'}/${responseData?.materials?.find(m => m.id == watch(`leftover.${index}.id`))?.name || '-'}`
                                    return (
                                        <div key={field.id} className="grid gap-lg span-12 align-end">
                                            <div className="span-4">
                                                <Input
                                                    id={`leftover.${index}.name`}
                                                    label={t('Material')}
                                                    value={String(materialLabel)}
                                                    disabled={true}
                                                />
                                            </div>
                                            <div className="span-4">
                                                <Controller
                                                    control={control}
                                                    name={`leftover.${index}.weight`}
                                                    render={({ field }) => (
                                                        <NumberFormattedInput
                                                            id={`leftover.${index}.weight`}
                                                            label={`${t('Excess roll')} (${t('kg')})`}
                                                            maxLength={12}
                                                            allowDecimals={true}
                                                            {...field}
                                                            disabled={detail}
                                                            error={errors?.leftover?.[index]?.weight?.message}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    )}

                    {itemFields.map((groupField, groupIndex) => {
                        const groupOrderData = responseData?.group_order?.[groupIndex]

                        return (
                            <div
                                key={groupField.id}
                                style={{
                                    border: '1px solid rgba(0, 0, 0, 0.12)',
                                    borderRadius: '12px',
                                    backgroundColor: groupIndex % 2 !== 0 ? 'rgba(0,120,212,0.25)' : 'rgba(0,120,212,0.6)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    maxWidth: '100%',
                                    padding: '1rem',
                                    width: '100%'
                                }}
                            >
                                <div className="grid gap-lg span-12" style={{
                                    borderBottom: '1px solid #eee',
                                    paddingBottom: '1.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    <PageIcon className="span-2">
                                        <Corrugation />
                                    </PageIcon>

                                    <div className="span-2">
                                        <Input
                                            id={`items.${groupIndex}.format`}
                                            disabled={true}
                                            label={`${t('Production format')} (${t('mm')})`}
                                            value={decimalToInteger(Number(groupOrderData?.separated_raw_materials_format?.format || 0))}
                                        />
                                    </div>
                                    <div className="span-2">
                                        <Input
                                            id="glue_square"
                                            disabled={true}
                                            label={`${t('Glue amount')} ${t('(m²)')} `}
                                            value={groupOrderData?.glue_square || 0.05}
                                        />
                                    </div>
                                    <div className="span-2">
                                        <Select
                                            id={`items.${groupIndex}.has_addition`}
                                            label="Cutting"
                                            disabled={true}
                                            options={booleanOptions as unknown as ISelectOption[]}
                                            value={getSelectValue(booleanOptions as unknown as ISelectOption[], groupField.has_addition)}
                                        />
                                    </div>

                                    {groupField.has_addition && (
                                        <div className="span-2">
                                            <Controller
                                                control={control}
                                                name={`items.${groupIndex}.pallet`}
                                                render={({ field }) => (
                                                    <NumberFormattedInput
                                                        id={`items.${groupIndex}.pallet`}
                                                        maxLength={12}
                                                        disableGroupSeparators={false}
                                                        allowDecimals={true}
                                                        label="Pallet count"
                                                        disabled={detail}
                                                        error={errors?.items?.[groupIndex]?.pallet?.message}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}

                                    <div className="span-12 grid gap-lg">
                                        {groupField.orders.map((orderField, orderIndex) => (
                                            <div className="grid gap-lg span-12" key={orderField.order_id}>
                                                <div className="span-3">
                                                    <Input
                                                        id={`items.${groupIndex}.orders.${orderIndex}.order_id`}
                                                        disabled={true}
                                                        label="Order number"
                                                        value={`#${orderField.order_id}`}
                                                    />
                                                </div>
                                                <div className="span-3">
                                                    <Controller
                                                        control={control}
                                                        name={`items.${groupIndex}.orders.${orderIndex}.count`}
                                                        render={({ field }) => (
                                                            <NumberFormattedInput
                                                                id={`items.${groupIndex}.orders.${orderIndex}.count`}
                                                                maxLength={12}
                                                                disableGroupSeparators={false}
                                                                allowDecimals={true}
                                                                label="Count"
                                                                disabled={detail}
                                                                error={errors?.items?.[groupIndex]?.orders?.[orderIndex]?.count?.message}
                                                                {...field}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        flexDirection: 'row',
                                        marginBottom: '.5rem',
                                        marginTop: '1rem',
                                        overflowX: 'auto',
                                        maxWidth: 'calc(100vw - 22rem)',
                                        paddingBottom: '.3rem',
                                        width: '100%'
                                    }}
                                >
                                    {
                                        groupOrderData?.orders.map(order => (
                                            <div key={order.id} style={{ minWidth: '47rem' }}>
                                                <OrderInfo order={order} />
                                            </div>
                                        ))
                                    }
                                    {
                                        groupField.has_addition &&
                                        <div style={{ minWidth: '35rem' }}>
                                            <Card
                                                screen={false}
                                                style={{ padding: '1.5rem' }}
                                                className="grid gap-md"
                                            >
                                                <div className="span-12">
                                                    <Diagram
                                                        second={true}
                                                        x={
                                                            <Input
                                                                id="x"
                                                                mini={true}
                                                                disabled={true}
                                                                placeholder="mm"
                                                                value={groupOrderData?.x || ''}
                                                            />
                                                        }
                                                        y={
                                                            <Input
                                                                id="y"
                                                                mini={true}
                                                                disabled={true}
                                                                placeholder="mm"
                                                                value={groupOrderData?.y || ''}
                                                            />
                                                        }
                                                    />
                                                </div>

                                                <div className="span-6">
                                                    <NumberFormattedInput
                                                        id="count"
                                                        disabled={true}
                                                        maxLength={6}
                                                        disableGroupSeparators={false}
                                                        allowDecimals={false}
                                                        label="Count"
                                                        value={groupOrderData?.count}
                                                    />
                                                </div>

                                                <div className="span-6">
                                                    <MaskInput
                                                        id="deadline"
                                                        disabled={true}
                                                        label="Deadline"
                                                        onChange={noop}
                                                        placeholder={getDate()}
                                                        mask="99.99.9999"
                                                        value={groupOrderData?.deadline ? getDate(groupOrderData?.deadline) : ''}
                                                    />
                                                </div>

                                                <div className="span-12">
                                                    <Input
                                                        id="comment"
                                                        disabled={true}
                                                        label="Comment"
                                                        value={groupOrderData?.comment || ' '}
                                                    />
                                                </div>

                                                <div
                                                    className="span-12 flex gap-md"
                                                    style={{
                                                        marginTop: '.75rem',
                                                        marginBottom: '1.5rem',
                                                        flexWrap: 'nowrap',
                                                        overflowX: 'auto'
                                                    }}
                                                >
                                                    {activityOptions.map((option) => (
                                                        <div key={option.value as string}
                                                            className="flex align-center gap-xs">
                                                            <input
                                                                id={option.value as string}
                                                                type="checkbox"
                                                                className="checkbox"
                                                                readOnly
                                                                checked={groupOrderData?.stages_to_passed?.includes(option.value as string) || false}
                                                            />
                                                            <p className="checkbox-label">
                                                                {t(option.label as string)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>
                                    }
                                </div>
                            </div>
                        )
                    })}
                </Form>
            </div>
        </>
    )
}

export default CorrugationOrder