import {Corrugation, Flex, RightArrow, YMO} from 'assets/icons'
import classNames from 'classnames'
import {Button, Card, Input, Loader} from 'components'
import {BUTTON_THEME} from 'constants/fields'
import {useDetail} from 'hooks/index'
import {IOrderDetail} from 'interfaces/orders.interface'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import styles from './styles.module.scss'


const Index = () => {
	const {id = undefined} = useParams()
	const {t} = useTranslation()
	const navigate = useNavigate()


	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IOrderDetail>('services/orders/', id, !!id)


	if (isDetailLoading) return (<Loader/>)


	return (
		<>
			<div style={{display: 'flex', justifyContent: 'flex-end'}}>
				<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
					Back
				</Button>
			</div>

			<Card
				screen={true}
				className={styles.sc}
				style={{
					marginTop: '1.5rem',
					padding: '1.5rem 1.5rem 1.5rem 1.5rem',
					width: 'calc(100vw - 19.5rem)',
					overflowX: 'scroll'
					// cursor: 'grab',
					// pointerEvents: 'auto',
					// userSelect: 'auto'
				}}
			>
				<div className={styles.root}>
					{
						detail?.stages_to_passed?.includes('gofra') &&
						<>
							<div
								className={classNames(styles.item, {[styles.inactive]: detail?.activity != 'gofra'})}
							>
								<h1>{t('Recycling')}</h1>
								<Corrugation/>
								<div className={styles['input-wrapper']}>
									<Input
										id="count 1"
										label="Count"
										placeholder=" "
										value={detail?.count_after_processing ?? ''}
										disabled={true}
									/>
								</div>
								{/*<div className={styles['input-wrapper']}>*/}
								{/*	<Input*/}
								{/*		id="Waste paper 1"*/}
								{/*		label={`${t('Waste paper')} (${t('kg')})`}*/}
								{/*		placeholder=" "*/}
								{/*		value={detail?.invalid_material_in_processing ?? ''}*/}
								{/*		disabled={true}*/}
								{/*	/>*/}
								{/*</div>*/}
								{/*<div className={styles['input-wrapper']}>*/}
								{/*	<Input*/}
								{/*		id="Waste paper percentage 1"*/}
								{/*		label={`${t('Waste paper percentage')} (${t('%')})`}*/}
								{/*		placeholder=" "*/}
								{/*		value={detail?.percentage_after_processing ?? ''}*/}
								{/*		disabled={true}*/}
								{/*	/>*/}
								{/*</div>*/}
								{/*<div className={styles['input-wrapper']}>*/}
								{/*	<Input*/}
								{/*		id="Waste paper area 1"*/}
								{/*		label={`${t('Waste paper area')} (${t('m²')})`}*/}
								{/*		placeholder=" "*/}
								{/*		value={detail?.mkv_after_processing ?? ''}*/}
								{/*		disabled={true}*/}
								{/*	/>*/}
								{/*</div>*/}
							</div>

						</>
					}

					{
						detail?.stages_to_passed?.includes('ymo1') &&
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {[styles.inactive]: detail?.activity != 'ymo1'})}
							>
								<h1>{t('Warehouse')}</h1>
								<YMO/>
								<div className={styles['input-wrapper']}>
									<Input
										id="count"
										label="Warehouse"
										placeholder=" "
										value={detail?.warehouse?.name ?? ''}
										disabled={true}
									/>
								</div>
							</div>

						</>
					}

					{
						detail?.stages_to_passed?.includes('fleksa') &&
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>

							<div
								className={classNames(styles.item, {[styles.inactive]: detail?.activity != 'fleksa'})}
							>
								<h1>{t('Flex')}</h1>
								<Flex/>
								<div className={styles['input-wrapper']}>
									<Input
										id="count 2"
										label="Count"
										placeholder=" "
										value={detail?.count_after_flex ?? ''}
										disabled={true}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Input
										id="Waste paper 2"
										label={`${t('Waste paper')} (${t('kg')})`}
										placeholder=" "
										value={detail?.invalid_material_in_flex ?? ''}
										disabled={true}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Input
										id="Waste paper percentage 2"
										label={`${t('Waste paper percentage')} (${t('%')})`}
										placeholder=" "
										value={detail?.percentage_after_flex ?? ''}
										disabled={true}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Input
										id="Waste paper area 2"
										label={`${t('Waste paper area')} (${t('m²')})`}
										placeholder=" "
										value={detail?.mkv_after_flex ?? ''}
										disabled={true}
									/>
								</div>
							</div>

						</>

					}

					{
						detail?.stages_to_passed?.includes('ymo2') &&
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>

							<div
								className={classNames(styles.item, {[styles.inactive]: detail?.activity != 'ymo2'})}
							>
								<h1>{t('Warehouse')}</h1>
								<YMO/>
								<div className={styles['input-wrapper']}>
									<div className={styles.item}>
										<Input
											id="count"
											label="Warehouse"
											placeholder=" "
											value={detail?.warehouse_same_finished?.name ?? ''}
											disabled={true}
										/>
									</div>
								</div>
							</div>

						</>
					}


					{
						(detail?.stages_to_passed?.includes('yelishlash') || detail?.stages_to_passed?.includes('tikish')) &&
						<>

							<div className={styles.arrow}>
								<RightArrow/>
							</div>

							<div
								className={classNames(styles.item, {[styles.inactive]: (detail?.activity !== 'yelimlash' && detail?.activity !== 'tikish')})}
							>
								<h1>{t('Sewing/Gluing')}</h1>
								<Corrugation/>
								<div className={styles['input-wrapper']}>
									<div className={styles.item}>
										<Input
											placeholder=" "
											id="count 3"
											label="Count"
											value={detail?.count_after_bet ?? detail?.count_after_gluing ?? ''}
											disabled={true}
										/>
									</div>
								</div>
								<div className={styles['input-wrapper']}>
									<Input
										id="Waste paper 3"
										label={`${t('Waste paper')} (${t('kg')})`}
										placeholder=" "
										value={detail?.invalid_material_in_bet ?? detail?.invalid_material_in_gluing ?? ''}
										disabled={true}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Input
										id="Waste paper percentage 3"
										label={`${t('Waste paper percentage')} (${t('%')})`}
										placeholder=" "
										value={detail?.percentage_after_bet ?? detail?.percentage_after_gluing ?? ''}
										disabled={true}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Input
										id="Waste paper area 3"
										label={`${t('Waste paper area')} (${t('m²')})`}
										placeholder=" "
										value={detail?.mkv_after_bet ?? detail?.percentage_after_gluing ?? ''}
										disabled={true}
									/>
								</div>
							</div>

						</>
					}

					{
						detail?.stages_to_passed?.includes('is_last') &&
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {[styles.inactive]: detail?.activity != 'is_last'})}>
								<h1>{t('Warehouse')}</h1>
								<YMO/>
								<div className={styles['input-wrapper']}>
									<div className={styles.item}>
										<Input
											id="count"
											label="Warehouse"
											placeholder=" "
											value={detail?.warehouse_finished?.name ?? ''}
											disabled={true}
										/>
									</div>
								</div>
							</div>
						</>
					}

				</div>
			</Card>
		</>
	)
}

export default Index