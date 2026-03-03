import { FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Diagram, Card, Input, NumberFormattedInput, MaskInput, PageTitle, Button } from 'components/index'
import { BUTTON_THEME } from 'constants/fields'
import { activityOptions } from 'helpers/options'
import { noop } from 'utilities/common'
import { getDate } from 'utilities/date'
import { useDetail } from 'hooks'
import { IPallet } from 'interfaces/orders.interface'

const PalletDetail: FC = () => {
    const { id } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { detail: pallet, isPending } = useDetail<IPallet>('services/pallets/', id)

    if (isPending) {
        return <div>{t('Loading...')}</div>
    }

    if (!pallet) {
        return <div>{t('Ma\'lumot topilmadi')}</div>
    }

    return (
        <div className="grid gap-lg">
            <PageTitle title={`${t('Paddon tafsilotlari')} #${pallet.id}`}>
                <div className="flex gap-sm justify-center align-center">
                    <Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
                        Orqaga
                    </Button>
                </div>
            </PageTitle>

            <Card className="grid gap-md span-8" style={{ padding: '1.5rem', backgroundColor: '#fff' }}>
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
                    <NumberFormattedInput
                        id="end_count"
                        disabled={true}
                        disableGroupSeparators={false}
                        allowDecimals={false}
                        label="Yakuniy soni"
                        value={pallet.end_count || 0}
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
        </div>
    )
}

export default PalletDetail
