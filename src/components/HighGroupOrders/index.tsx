import {IGroupOrder} from 'interfaces/groupOrders.interface'
import OrderInfo from 'components/OrderInfo'
import {Button, Input, MaskInput, NumberFormattedInput, Select} from 'components/UI'
import {BUTTON_THEME} from 'constants/fields'
import {useActions} from 'hooks/index'
import {decimalToInteger, getSelectValue, noop} from 'utilities/common'
import {activityOptions, booleanOptions} from 'helpers/options'
import {ISelectOption} from 'interfaces/form.interface'
import {useTranslation} from 'react-i18next'
import Card from 'components/Card'
import {Diagram} from 'components/index'
import {getDate} from 'utilities/date'


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
							// backgroundColor: '#ffffff',
							backgroundColor: index % 2 !== 0 ? 'rgba(0,120,212,0.25)' : 'rgba(0,120,212,0.6)',
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
							{
								item.has_addition &&
								<div style={{minWidth: '35rem'}}>
									<Card
										screen={false}
										style={{padding: '1.5rem'}}
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
														value={item?.x || ''}
													/>
												}
												y={
													<Input
														id="y"
														mini={true}
														disabled={true}
														placeholder="mm"
														value={item?.y || ''}
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
												value={item?.count}
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
												value={item?.deadline ? getDate(item?.deadline) : ''}
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
												<>
													<input
														id={option.value as string}
														type="checkbox"
														className="checkbox"
														checked={item?.stages_to_passed?.includes(option.value as string) || false}
													/>
													<p className="checkbox-label">
														{t(option.label as string)}
													</p>
												</>
											))}
										</div>
									</Card>
								</div>
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