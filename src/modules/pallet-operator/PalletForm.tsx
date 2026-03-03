import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FC, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Form, NumberFormattedInput, PageTitle, Diagram, MaskInput, Input } from 'components/index'
import { BUTTON_THEME } from 'constants/fields'
import { useDetail, useUpdate } from 'hooks'
import { IPallet } from 'interfaces/orders.interface'
import { useTranslation } from 'react-i18next'
import { noop } from 'utilities/common'
import { getDate } from 'utilities/date'
import { activityOptions } from 'helpers/options'

const schema = yup.object().shape({
    end_count: yup.string().required('Required')
})

interface IProps {
    retrieve?: boolean
    type?: 'flex' | 'glue' | 'bet'
}

const PalletForm: FC<IProps> = ({ retrieve = false, type }) => {
    const { id } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { detail: pallet, isPending } = useDetail<IPallet>('services/pallets/', id)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        mode: 'onTouched',
        defaultValues: {
            end_count: ''
        },
        resolver: yupResolver(schema)
    })

    const { mutateAsync: update, isPending: isUpdate } = useUpdate('services/pallets/', id, 'patch')

    useEffect(() => {
        if (retrieve && pallet) {
            reset({ end_count: pallet.end_count?.toString() || '' })
        } else if (pallet) {
            reset({ end_count: '' })
        }
    }, [pallet, retrieve, reset])

    const onSubmit = (data: any) => {
        let payload: any = {}
        if (type === 'flex') payload = { pallet_count_after_flex: data.end_count }
        else if (type === 'glue') payload = { pallet_count_after_glue: data.end_count }
        else if (type === 'bet') payload = { pallet_count_after_bet: data.end_count }
        else payload = { end_count: data.end_count }

        update(payload).then(() => {
            navigate(-1)
        })
    }

    if (isPending) return <div>{t('Loading...')}</div>
    if (!pallet) return <div>{t('Ma\'lumot topilmadi')}</div>

    return (
        <div className="grid gap-lg">
            <PageTitle title={`${t('Paddon tafsilotlari')} #${pallet.id}`}>
                <div className="flex gap-sm justify-center align-center">
                    <Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
                        Orqaga
                    </Button>
                    {!retrieve && (
                        <Button onClick={handleSubmit(onSubmit)} disabled={isUpdate}>
                            Jo'natish
                        </Button>
                    )}
                </div>
            </PageTitle>

            <Form className="span-8" onSubmit={(e) => e.preventDefault()}>
                <Card className="grid gap-md" style={{ padding: '1.5rem', backgroundColor: '#fff' }}>
                    <div className="span-12">
                        <Diagram
                            second={true}
                            x={
                                <Input
                                    id="x"
                                    mini={true}
                                    disabled={true}
                                    placeholder="mm"
                                    value={pallet.x || ''}
                                />
                            }
                            y={
                                <Input
                                    id="y"
                                    mini={true}
                                    disabled={true}
                                    placeholder="mm"
                                    value={pallet.y || ''}
                                />
                            }
                        />
                    </div>

                    <div className="span-6">
                        <NumberFormattedInput
                            id="count"
                            disabled={true}
                            disableGroupSeparators={false}
                            allowDecimals={false}
                            label="Soni"
                            value={pallet.count}
                        />
                    </div>

                    <div className="span-6">
                        <Controller
                            control={control}
                            name="end_count"
                            render={({ field }) => (
                                <NumberFormattedInput
                                    id="end_count"
                                    maxLength={12}
                                    disableGroupSeparators={false}
                                    allowDecimals={false}
                                    disabled={retrieve}
                                    label="Yakuniy soni"
                                    error={errors?.end_count?.message}
                                    {...field}
                                />
                            )}
                        />
                    </div>

                    <div className="span-6">
                        <Input
                            id="status"
                            disabled={true}
                            label="Holati"
                            value={pallet.status || ''}
                        />
                    </div>

                    <div className="span-6">
                        <MaskInput
                            id="deadline"
                            disabled={true}
                            label="Muddati"
                            onChange={noop}
                            placeholder="--"
                            mask="99.99.9999"
                            value={pallet.deadline ? getDate(pallet.deadline) : ''}
                        />
                    </div>

                    <div className="span-6">
                        <MaskInput
                            id="end_date"
                            disabled={true}
                            label="Yak. sana"
                            onChange={noop}
                            placeholder="--"
                            mask="99.99.9999"
                            value={pallet.end_date ? getDate(pallet.end_date) : ''}
                        />
                    </div>

                    {pallet.warehouse && (
                        <div className="span-4">
                            <Input
                                id="warehouse"
                                disabled={true}
                                label="Omborxona"
                                value={pallet.warehouse?.name || ''}
                            />
                        </div>
                    )}

                    {pallet.warehouse_same_finished && (
                        <div className="span-4">
                            <Input
                                id="warehouse_same_finished"
                                disabled={true}
                                label="Yarim tayyor omborxona"
                                value={pallet.warehouse_same_finished?.name || ''}
                            />
                        </div>
                    )}

                    {pallet.warehouse_finished && (
                        <div className="span-4">
                            <Input
                                id="warehouse_finished"
                                disabled={true}
                                label="Tayyor omborxona"
                                value={pallet.warehouse_finished?.name || ''}
                            />
                        </div>
                    )}

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
                            <div key={option.value as string} className="flex align-center gap-xs">
                                <input
                                    id={option.value as string}
                                    type="checkbox"
                                    className="checkbox"
                                    readOnly
                                    checked={pallet.stages_to_passed?.includes(option.value as string) || false}
                                />
                                <p className="checkbox-label">
                                    {t(option.label as string)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </Form>
        </div>
    )
}

export default PalletForm
