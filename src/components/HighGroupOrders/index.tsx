import {IGroupOrder} from 'interfaces/groupOrders.interface'
import OrderInfo from 'components/OrderInfo'
import {Button, Input, Select} from 'components/UI'
import {BUTTON_THEME} from 'constants/fields'
import {useActions} from 'hooks/index'
import {decimalToInteger, getSelectValue} from 'utilities/common'
import {booleanOptions} from 'helpers/options'
import {ISelectOption} from 'interfaces/form.interface'
import {useTranslation} from 'react-i18next'


const Index = ({groupOrders, detail = false}: { groupOrders: IGroupOrder[], detail?: boolean }) => {
	const {removeGroupOrder} = useActions()
	const {t} = useTranslation()

	return (
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
			{
				groupOrders.map((item, index) => (
					<div
						style={{
							border: '1px solid rgba(0, 0, 0, 0.12)',
							borderRadius: '12px',
							backgroundColor: '#ffffff',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
							maxWidth: '100%',
							padding: '1rem',
							width: '100%'
						}}
					>
						<div className="grid gap-lg span-12" style={{marginBottom: '.75rem'}}>
							<div className="span-3">
								<Input
									id="format"
									disabled={true}
									label={`${t('Production format')} (${t('mm')})`}
									value={decimalToInteger(Number(item?.separated_raw_materials_format?.format || 0))}
								/>
							</div>
							<div className="span-3">
								<Select
									id="has_addition"
									label="Cutting"
									disabled={true}
									options={booleanOptions as unknown as ISelectOption[]}
									value={getSelectValue(booleanOptions as unknown as ISelectOption[], item?.has_addition)}
									defaultValue={getSelectValue(booleanOptions as unknown as ISelectOption[], item?.has_addition)}
								/>
							</div>
							<div className="span-3">
								<Input
									id="glue_square"
									disabled={true}
									label={`${t('Glue amount')} ${t('(m²)')} `}
									value={item?.glue_square || 0.05}
								/>
							</div>
						</div>
						<div
							style={{
								display: 'flex',
								gap: '1rem',
								flexDirection: 'row',
								marginBottom: '.5rem',
								overflowX: 'auto',
								maxWidth: 'calc(100vw - 22rem)',
								paddingBottom: '.3rem',
								width: '100%'
							}}
						>
							{
								item.orders.map(order => (
									<div style={{minWidth: '47rem'}}>
										<OrderInfo order={order}/>
									</div>
								))
							}
						</div>
						{
							index !== 0 && !detail &&
							<div style={{
								display: 'flex',
								gap: '1rem',
								justifyContent: 'flex-start',
								alignItems: 'center'
							}}>
								<Button
									theme={BUTTON_THEME.DANGER}
									onClick={() => removeGroupOrder(item.id)}
								>
									Delete
								</Button>
							</div>
						}
					</div>
				))
			}
		</div>
	)
}

export default Index