import {IFIle, ISelectOption} from 'interfaces/form.interface'
import {FC, useEffect} from 'react'
import {
	Button,
	Card,
	Form,
	Input,
	Loader,
	PageTitle,
	FileUpLoader,
	NumberFormattedInput,
	Select, Wrapper, MaskInput
} from 'components'
import {IProductDetail} from 'interfaces/products.interface'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useForm, Controller, useFieldArray} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useAdd, useData, useDetail, usePaginatedData, useUpdate} from 'hooks'
import {ordersSchema, productSchema} from 'helpers/yup'
import {getSelectOptionsByKey, getSelectValue} from 'utilities/common'
import {Box} from 'assets/icons'
// import {Box, Plus} from 'assets/icons'
import {ISearchParams} from 'interfaces/params.interface'
import {useTranslation} from 'react-i18next'
import {IOrderDetail} from 'interfaces/orders.interface'
import {getDate} from 'utilities/date'


interface IProperties {
	edit?: boolean;
}

const ProductPage: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {orderId: id = undefined, id: customer = undefined} = useParams()
	const {data: products = []} = usePaginatedData<ISearchParams[]>('products/')

	const {
		// handleSubmit,
		control,
		register,
		reset,
		// watch,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(productSchema),
		mode: 'onTouched',
		defaultValues: {
			name: '',
			width: '',
			height: '',
			length: '',
			box_ear: '',
			format: '',
			layer: [],
			logo: undefined
		}
	})

	const {
		handleSubmit: orderHandleSubmit,
		control: orderControl,
		register: orderRegister,
		reset: orderReset,
		watch: orderWatch,
		formState: {errors: orderErrors}
	} = useForm({
		resolver: yupResolver(ordersSchema),
		mode: 'onTouched',
		defaultValues: {
			product: undefined,
			comment: '',
			price: '',
			deadline: '',
			money_paid: '',
			count: ''
		}
	})

	const {data: materials = []} = useData<ISelectOption[]>('products/materials/select', !!orderWatch('product'))


	// const {fields, append, remove} = useFieldArray({
	// 	control,
	// 	name: 'layer' as never
	// })

	const {fields} = useFieldArray({
		control,
		name: 'layer' as never
	})

	const {mutateAsync: addOrder, isPending: isAdding} = useAdd('services/orders')
	const {mutateAsync: updateOrder, isPending: isUpdating} = useUpdate('services/orders/', id)

	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IOrderDetail>('services/orders/', id, edit)

	const {
		data: productDetail,
		isPending: isProductDetailLoading
	} = useDetail<IProductDetail>('products/', orderWatch('product'), !!orderWatch('product'))

	useEffect(() => {
		if (productDetail && !isProductDetailLoading) {
			reset({
				name: productDetail.name,
				width: productDetail.width,
				height: productDetail.height,
				length: productDetail.length,
				box_ear: productDetail.box_ear,
				format: productDetail.format,
				logo: productDetail.logo || undefined,
				layer: productDetail?.layer || []
			})
		}
	}, [productDetail, edit, reset])

	useEffect(() => {
		if (detail && edit) {
			orderReset({
				product: detail.product?.id as unknown as string,
				count: detail.count,
				money_paid: detail.money_paid,
				deadline: getDate(detail.deadline),
				price: detail.price,
				comment: detail.comment
			})
		}
	}, [detail, edit, orderReset])


	if (isDetailLoading && edit) {
		return <Loader screen/>
	}

	return (
		<>
			<PageTitle title={edit ? 'Edit order' : 'Add order'}>
				<div className="flex justify-center gap-lg align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					<Button
						type={FIELD.BUTTON}
						theme={BUTTON_THEME.PRIMARY}
						disabled={isAdding || isUpdating}
						onClick={() => {
							if (!edit) {
								orderHandleSubmit((data) =>
									addOrder({...data, customer})
										.then(async () => {
											orderReset({
												product: undefined,
												comment: '',
												price: '',
												deadline: '',
												money_paid: '',
												count: ''
											})
											navigate(-1)
										})
								)()
							} else {
								orderHandleSubmit((data) =>
									updateOrder({...data, customer})
										.then(async () => {
											orderReset({
												product: undefined,
												comment: '',
												price: '',
												deadline: '',
												money_paid: '',
												count: ''
											})
											navigate(-1)
										})
								)()
							}
						}}
					>
						{edit ? 'Edit' : 'Save'}
					</Button>
				</div>
			</PageTitle>
			<Card style={{padding: '1.5rem'}}>
				<Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
					<div className="grid span-12 gap-xl flex-0">
						<div className="span-4">
							<Controller
								name="product"
								control={orderControl}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id="product"
										label="Product"
										// top={true}
										options={getSelectOptionsByKey(products)}
										error={orderErrors?.product?.message}
										value={getSelectValue(getSelectOptionsByKey(products), value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(getSelectOptionsByKey(products), value)}
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>
						</div>

						<div className="span-4">
							<Controller
								name="count"
								control={orderControl}
								render={({field}) => (
									<NumberFormattedInput
										id="count"
										maxLength={4}
										disableGroupSeparators
										allowDecimals={false}
										label="Count"
										error={orderErrors?.count?.message}
										{...field}
									/>
								)}
							/>
						</div>

						<div className="span-4">
							<Controller
								name="deadline"
								control={orderControl}
								render={({field}) => (
									<MaskInput
										id="deadline"
										label="Deadline"
										placeholder={getDate()}
										mask="99.99.9999"
										error={orderErrors?.deadline?.message}
										{...field}
									/>
								)}
							/>
						</div>
					</div>

					{
						(orderWatch('product') && productDetail) &&
						<>
							<div className="span-4">
								<Input
									id="name"
									type={FIELD.TEXT}
									disabled={true}
									label="Name"
									error={errors?.name?.message}
									{...register('name')}
								/>
							</div>

							<div className="span-4">
								<Controller
									name="format"
									control={control}
									render={({field}) => (
										<NumberFormattedInput
											id="format"
											maxLength={3}
											disabled={true}
											disableGroupSeparators
											allowDecimals={false}
											label={`${t('Format')} (${t('sm')})`}
											error={errors?.format?.message}
											{...field}
										/>
									)}
								/>
							</div>

							<div className="span-4">
								<Controller
									control={control}
									name="box_ear"
									render={({field}) => (
										<NumberFormattedInput
											id="box_ear"
											maxLength={3}
											disabled={true}
											disableGroupSeparators
											allowDecimals={false}
											label={`${t('Box ear')} (${t('mm')})`}
											error={errors?.box_ear?.message}
											{...field}
										/>
									)}
								/>
							</div>

							<div className="span-4">
								<Controller
									name="logo"
									control={control}
									render={({field: {value, ref, onChange, onBlur}}) => (
										<FileUpLoader
											id="logo"
											ref={ref}
											type="image"
											value={value as IFIle}
											disabled={true}
											onBlur={onBlur}
											onChange={onChange}
											label="Logo"
											error={errors?.logo?.message}
										/>
									)}
								/>
							</div>

							<div className="span-4 flex flex-col gap-lg">
								<Controller
									control={control}
									name="width"
									render={({field}) => (
										<NumberFormattedInput
											id="width"
											label={`${t('Sizes')} (${t('mm')})`}
											maxLength={3}
											disableGroupSeparators
											disabled={true}
											allowDecimals={false}
											placeholder={`a (${t('mm')})`}
											error={errors?.width?.message}
											{...field}
										/>
									)}
								/>

								<Controller
									control={control}
									name="length"
									render={({field}) => (
										<NumberFormattedInput
											id="length"
											maxLength={3}
											disableGroupSeparators
											allowDecimals={false}
											disabled={true}
											placeholder={`b (${t('mm')})`}
											error={errors?.length?.message}
											{...field}
										/>
									)}
								/>

								<Controller
									control={control}
									name="height"
									render={({field}) => (
										<NumberFormattedInput
											id="height"
											maxLength={3}
											disableGroupSeparators
											allowDecimals={false}
											disabled={true}
											placeholder={`c (${t('mm')})`}
											error={errors?.height?.message}
											{...field}
										/>
									)}
								/>
							</div>

							<Wrapper className="span-4 align-center justify-center">
								<Box/>
							</Wrapper>

							<>
								{
									fields?.map((field, index) => (
										<div className="span-4" key={field.id}>
											<Controller
												name={`layer.${index}`}
												control={control}
												render={({field: {value, ref, onChange, onBlur}}) => (
													<Select
														id={`layer-${index + 1}`}
														label={`${index + 1}-${t('layer')}`}
														top={true}
														options={materials}
														isDisabled={true}
														error={errors?.layer?.[index]?.message}
														// handleDelete={() => remove(index)}
														value={getSelectValue(materials, value)}
														ref={ref}
														onBlur={onBlur}
														defaultValue={getSelectValue(materials, value)}
														handleOnChange={(e) => onChange(e as string)}
													/>
												)}
											/>
										</div>
									))
								}
							</>

							{/*<div className="span-4" style={{marginTop: '2rem'}}>*/}
							{/*	<Button*/}
							{/*		theme={BUTTON_THEME.PRIMARY}*/}
							{/*		type="button"*/}
							{/*		disabled={(watch('layer')?.length !== 0 && watch('layer')?.[(watch('layer')?.length ?? 1) - 1]?.toString()?.trim() === '') || !!orderWatch('product')}*/}
							{/*		icon={<Plus/>}*/}
							{/*		onClick={() => append('')}*/}
							{/*	>*/}
							{/*		Add layer*/}
							{/*	</Button>*/}
							{/*</div>*/}
						</>
					}

					<div className="span-12 grid gap-xl flex-0">
						<div className="span-4">
							<Controller
								name="price"
								control={orderControl}
								render={({field}) => (
									<NumberFormattedInput
										id="price"
										maxLength={13}
										disableGroupSeparators={false}
										allowDecimals={true}
										label="Price"
										error={orderErrors?.price?.message}
										{...field}
									/>
								)}
							/>
						</div>

						<div className="span-4">
							<Controller
								name="money_paid"
								control={orderControl}
								render={({field}) => (
									<NumberFormattedInput
										id="money_paid"
										maxLength={13}
										disableGroupSeparators={false}
										allowDecimals={true}
										label="Paid money"
										error={orderErrors?.money_paid?.message}
										{...field}
									/>
								)}
							/>
						</div>

						<div className="span-4">
							<Input
								id="comment"
								label={`Comment`}
								error={orderErrors?.comment?.message}
								{...orderRegister(`comment`)}
							/>
						</div>
					</div>
				</Form>
			</Card>
		</>
	)
}

export default ProductPage