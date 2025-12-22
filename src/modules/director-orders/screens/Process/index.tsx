import {yupResolver} from '@hookform/resolvers/yup'
import {Corrugation, Flex, RightArrow, YMO} from 'assets/icons'
import {Button, Card, Input, Loader, NumberFormattedInput, PageTitle} from 'components'
import {BUTTON_THEME} from 'constants/fields'
import {orderUpdateSchema} from 'helpers/yup'
import {useDetail, useUpdate} from 'hooks'
import {IOrderDetail} from 'interfaces/orders.interface'
import {FC, useEffect} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import classNames from 'classnames'
import {InferType} from 'yup'
import styles from './styles.module.scss'


interface IProperties {
	update?: boolean
}

const Index: FC<IProperties> = ({update: edit = false}) => {
	const {id = undefined} = useParams()
	const {t} = useTranslation()
	const navigate = useNavigate()

	const {
		data: detail,
		isPending: isDetailLoading,
		refetch
	} = useDetail<IOrderDetail>('services/orders/', id, !!id)

	const {
		mutateAsync: update,
		isPending: isUpdate
	} = useUpdate('services/orders/', id, 'patch')

	const {
		reset,
		control,
		handleSubmit,
		formState: {errors}
	} = useForm<InferType<typeof orderUpdateSchema>>({
		mode: 'onTouched',
		defaultValues: {
			count_after_processing: '',
			invalid_material_in_processing: '',
			percentage_after_processing: '',
			mkv_after_processing: '',
			count_after_flex: '',
			invalid_material_in_flex: '',
			percentage_after_flex: '',
			mkv_after_flex: '',
			count_after_bet: '',
			invalid_material_in_bet: '',
			percentage_after_bet: '',
			mkv_after_bet: '',
			count_after_gluing: '',
			invalid_material_in_gluing: '',
			percentage_after_gluing: '',
			mkv_after_gluing: ''
		},
		resolver: yupResolver(orderUpdateSchema)
	})

	useEffect(() => {
		if (detail) {
			reset({
				count_after_processing: detail?.count_after_processing ?? '',
				invalid_material_in_processing: detail?.invalid_material_in_processing ?? '',
				percentage_after_processing: detail?.percentage_after_processing ?? '',
				mkv_after_processing: detail?.mkv_after_processing ?? '',
				count_after_flex: detail?.count_after_flex ?? '',
				invalid_material_in_flex: detail?.invalid_material_in_flex ?? '',
				percentage_after_flex: detail?.percentage_after_flex ?? '',
				mkv_after_flex: detail?.mkv_after_flex ?? '',
				count_after_bet: detail?.count_after_bet ?? '',
				invalid_material_in_bet: detail?.invalid_material_in_bet ?? '',
				percentage_after_bet: detail?.percentage_after_bet ?? '',
				mkv_after_bet: detail?.mkv_after_bet ?? '',
				count_after_gluing: detail?.count_after_gluing ?? '',
				invalid_material_in_gluing: detail?.invalid_material_in_gluing ?? '',
				percentage_after_gluing: detail?.percentage_after_gluing ?? '',
				mkv_after_gluing: detail?.mkv_after_gluing ?? ''
			})
		}
	}, [detail, reset])

	const onSubmit = (data: InferType<typeof orderUpdateSchema>) => {
		const newData = {
			count_after_processing: data.count_after_processing,
			count_after_flex: data.count_after_flex,
			invalid_material_in_flex: data.invalid_material_in_flex,
			percentage_after_flex: data.percentage_after_flex,
			mkv_after_flex: data.mkv_after_flex,
			count_after_bet: data.count_after_bet,
			invalid_material_in_bet: data.invalid_material_in_bet,
			percentage_after_bet: data.percentage_after_bet,
			mkv_after_bet: data.mkv_after_bet,
			count_after_gluing: data.count_after_gluing,
			invalid_material_in_gluing: data.invalid_material_in_gluing,
			percentage_after_gluing: data.percentage_after_gluing,
			mkv_after_gluing: data.mkv_after_gluing
		}

		update(newData).then(() => {
			// navigate(-1)
			refetch()
		})
	}

	if (isDetailLoading) return <Loader/>

	console.log(errors)
	return (
		<>
			<PageTitle title={t('Order Details')}>
				<div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						{t('Back')}
					</Button>
					{
						edit &&
						<Button onClick={handleSubmit(onSubmit)} disabled={isUpdate}>
							Save
						</Button>
					}
				</div>
			</PageTitle>

			<Card
				screen={true}
				className={styles.sc}
				style={{
					marginTop: '1.5rem',
					padding: '1.5rem',
					width: 'calc(100vw - 19.5rem)',
					overflowX: 'scroll'
				}}
			>
				<div className={styles.root}>
					{detail?.stages_to_passed?.includes('gofra') && (
						<>
							<div
								className={classNames(styles.item, {
									[styles.inactive]: detail?.activity !== 'gofra'
								})}
							>
								<h1>{t('Recycling')}</h1>
								<Corrugation/>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="count_after_processing"
										render={({field}) => (
											<NumberFormattedInput
												id="count_after_processing"
												label={t('Count')}
												maxLength={12}
												allowDecimals={false}
												error={errors.count_after_processing?.message}
												{...field}
											/>
										)}
									/>
								</div>
								{/*<div className={styles['input-wrapper']}>*/}
								{/*	<Controller*/}
								{/*		control={control}*/}
								{/*		name="invalid_material_in_processing"*/}
								{/*		render={({field}) => (*/}
								{/*			<NumberFormattedInput*/}
								{/*				id="invalid_material_in_processing"*/}
								{/*				label={`${t('Waste paper')} (${t('kg')})`}*/}
								{/*				maxLength={12}*/}
								{/*				allowDecimals={true}*/}
								{/*				error={errors.invalid_material_in_processing?.message}*/}
								{/*				{...field}*/}
								{/*			/>*/}
								{/*		)}*/}
								{/*	/>*/}
								{/*</div>*/}
								{/*<div className={styles['input-wrapper']}>*/}
								{/*	<Controller*/}
								{/*		control={control}*/}
								{/*		name="percentage_after_processing"*/}
								{/*		render={({field}) => (*/}
								{/*			<NumberFormattedInput*/}
								{/*				id="percentage_after_processing"*/}
								{/*				label={`${t('Waste paper percentage')} (${t('%')})`}*/}
								{/*				maxLength={12}*/}
								{/*				allowDecimals={true}*/}
								{/*				error={errors.percentage_after_processing?.message}*/}
								{/*				{...field}*/}
								{/*			/>*/}
								{/*		)}*/}
								{/*	/>*/}
								{/*</div>*/}
								{/*<div className={styles['input-wrapper']}>*/}
								{/*	<Controller*/}
								{/*		control={control}*/}
								{/*		name="mkv_after_processing"*/}
								{/*		render={({field}) => (*/}
								{/*			<NumberFormattedInput*/}
								{/*				id="mkv_after_processing"*/}
								{/*				label={`${t('Waste paper area')} (${t('m²')})`}*/}
								{/*				maxLength={12}*/}
								{/*				allowDecimals={false}*/}
								{/*				error={errors.mkv_after_processing?.message}*/}
								{/*				{...field}*/}
								{/*			/>*/}
								{/*		)}*/}
								{/*	/>*/}
								{/*</div>*/}
							</div>
						</>
					)}

					{detail?.stages_to_passed?.includes('ymo1') && (
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {
									[styles.inactive]: detail?.activity !== 'ymo1'
								})}
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
					)}

					{detail?.stages_to_passed?.includes('fleksa') && (
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {
									[styles.inactive]: detail?.activity !== 'fleksa'
								})}
							>
								<h1>{t('Flex')}</h1>
								<Flex/>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="count_after_flex"
										render={({field}) => (
											<NumberFormattedInput
												id="count_after_flex"
												label={t('Count')}
												maxLength={12}
												allowDecimals={false}
												error={errors.count_after_flex?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="invalid_material_in_flex"
										render={({field}) => (
											<NumberFormattedInput
												id="invalid_material_in_flex"
												label={`${t('Waste paper')} (${t('kg')})`}
												maxLength={12}
												allowDecimals={true}
												error={errors.invalid_material_in_flex?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="percentage_after_flex"
										render={({field}) => (
											<NumberFormattedInput
												id="percentage_after_flex"
												label={`${t('Waste paper percentage')} (${t('%')})`}
												maxLength={12}
												allowDecimals={true}
												error={errors.percentage_after_flex?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="mkv_after_flex"
										render={({field}) => (
											<NumberFormattedInput
												id="mkv_after_flex"
												label={`${t('Waste paper area')} (${t('m²')})`}
												maxLength={12}
												allowDecimals={false}
												error={errors.mkv_after_flex?.message}
												{...field}
											/>
										)}
									/>
								</div>
							</div>
						</>
					)}

					{detail?.stages_to_passed?.includes('ymo2') && (
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {
									[styles.inactive]: detail?.activity !== 'ymo2'
								})}
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
					)}

					{detail?.stages_to_passed?.includes('tikish') && (
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {
									[styles.inactive]: detail?.activity !== 'tikish'
								})}
							>
								<h1>{t('Sewing')}</h1>
								<Corrugation/>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="count_after_bet"
										render={({field}) => (
											<NumberFormattedInput
												id="count_after_bet"
												label={t('Count')}
												maxLength={12}
												allowDecimals={false}
												error={errors.count_after_bet?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="invalid_material_in_bet"
										render={({field}) => (
											<NumberFormattedInput
												id="invalid_material_in_bet"
												label={`${t('Waste paper')} (${t('kg')})`}
												maxLength={12}
												allowDecimals={true}
												error={errors.invalid_material_in_bet?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="percentage_after_bet"
										render={({field}) => (
											<NumberFormattedInput
												id="percentage_after_bet"
												label={`${t('Waste paper percentage')} (${t('%')})`}
												maxLength={12}
												allowDecimals={true}
												error={errors.percentage_after_bet?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="mkv_after_bet"
										render={({field}) => (
											<NumberFormattedInput
												id="mkv_after_bet"
												label={`${t('Waste paper area')} (${t('m²')})`}
												maxLength={12}
												allowDecimals={false}
												error={errors.mkv_after_bet?.message}
												{...field}
											/>
										)}
									/>
								</div>
							</div>
						</>
					)}

					{detail?.stages_to_passed?.includes('yelishlash') && (
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {
									[styles.inactive]: detail?.activity !== 'yelimlash'
								})}
							>
								<h1>{t('Gluing')}</h1>
								<Corrugation/>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="count_after_gluing"
										render={({field}) => (
											<NumberFormattedInput
												id="count_after_gluing"
												label={t('Count')}
												maxLength={12}
												allowDecimals={false}
												error={errors.count_after_gluing?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="invalid_material_in_gluing"
										render={({field}) => (
											<NumberFormattedInput
												id="invalid_material_in_gluing"
												label={`${t('Waste paper')} (${t('kg')})`}
												maxLength={12}
												allowDecimals={true}
												error={errors.invalid_material_in_gluing?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="percentage_after_gluing"
										render={({field}) => (
											<NumberFormattedInput
												id="percentage_after_gluing"
												label={`${t('Waste paper percentage')} (${t('%')})`}
												maxLength={12}
												allowDecimals={true}
												error={errors.percentage_after_gluing?.message}
												{...field}
											/>
										)}
									/>
								</div>
								<div className={styles['input-wrapper']}>
									<Controller
										control={control}
										name="mkv_after_gluing"
										render={({field}) => (
											<NumberFormattedInput
												id="mkv_after_gluing"
												label={`${t('Waste paper area')} (${t('m²')})`}
												maxLength={12}
												allowDecimals={false}
												error={errors.mkv_after_gluing?.message}
												{...field}
											/>
										)}
									/>
								</div>
							</div>
						</>
					)}

					{detail?.stages_to_passed?.includes('is_last') && (
						<>
							<div className={styles.arrow}>
								<RightArrow/>
							</div>
							<div
								className={classNames(styles.item, {
									[styles.inactive]: detail?.activity !== 'is_last'
								})}
							>
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
					)}
				</div>
			</Card>
		</>
	)
}

export default Index