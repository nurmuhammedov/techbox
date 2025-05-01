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
import {useAdd, useData, useDetail, useUpdate} from 'hooks'
import {ordersSchema} from 'helpers/yup'
import {getSelectValue, modifyObjectField} from 'utilities/common'
import {Box, Plus} from 'assets/icons'
import {useTranslation} from 'react-i18next'
import {IOrderDetail} from 'interfaces/orders.interface'
import {getDate} from 'utilities/date'
import {ISearchParams} from 'interfaces/params.interface'


interface IProperties {
	edit?: boolean;
}

const ProductPage: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
	const {orderId: id = undefined, id: customer = undefined} = useParams()
	const {data: products = []} = useData<ISelectOption[]>('products/select')
	const {data: materials = []} = useData<ISelectOption[]>('products/material-types-seller/select')
	const {data: formats = []} = useData<ISelectOption[]>('products/formats/select')

	const {
		handleSubmit,
		control,
		register,
		reset,
		watch,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(ordersSchema),
		mode: 'onTouched',
		defaultValues: {
			product: undefined,
			comment: '',
			price: '',
			deadline: '',
			money_paid: '',
			count: '',
			// product
			name: '',
			width: '',
			height: '',
			length: '',
			box_ear: '',
			format: undefined,
			layer_seller: [' '],
			logo: undefined
		}
	})

	const {fields, append, remove} = useFieldArray({
		control,
		name: 'layer_seller' as never
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
	} = useDetail<IProductDetail>('products/', watch('product'), !!watch('product'))

	useEffect(() => {
		if (productDetail && !isProductDetailLoading) {
			reset((prev) => ({
				...prev,
				name: productDetail.name,
				width: productDetail.width,
				height: productDetail.height,
				length: productDetail.length,
				box_ear: productDetail.box_ear,
				format: productDetail.format,
				logo: productDetail.logo || undefined,
				layer_seller: productDetail?.layer_seller || [' ']
			}))
		}
	}, [productDetail, edit])

	useEffect(() => {
		if (detail && edit) {
			reset({
				// product: undefined,
				count: detail.count,
				money_paid: detail.money_paid,
				deadline: getDate(detail.deadline),
				price: detail.price,
				comment: detail.comment,
				// product
				name: detail.name,
				width: detail.width,
				height: detail.height,
				length: detail.length,
				box_ear: detail.box_ear,
				format: detail.format?.id,
				logo: detail.logo || undefined,
				layer_seller: detail?.layer_seller || [' ']
			})
		}
	}, [detail, edit])


	if (isDetailLoading && edit) {
		return <Loader/>
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
								handleSubmit((data) =>
									addOrder(modifyObjectField({...data, customer} as ISearchParams, 'logo'))
										.then(async () => {
											reset({
												product: undefined,
												comment: '',
												price: '',
												deadline: '',
												money_paid: '',
												count: '',
												// product
												name: '',
												width: '',
												height: '',
												length: '',
												box_ear: '',
												format: undefined,
												layer_seller: [],
												logo: undefined
											})
											navigate(-1)
										})
								)()
							} else {
								handleSubmit((data) =>
									updateOrder(modifyObjectField({...data, customer} as ISearchParams, 'logo'))
										.then(async () => {
											reset({
												product: undefined,
												comment: '',
												price: '',
												deadline: '',
												money_paid: '',
												count: '',
												// product
												name: '',
												width: '',
												height: '',
												length: '',
												box_ear: '',
												format: undefined,
												layer_seller: [],
												logo: undefined
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
					{
						!edit &&
						<div className="grid span-12 gap-xl flex-0">
							<div className="span-4">
								<Controller
									name="product"
									control={control}
									render={({field: {value, ref, onChange, onBlur}}) => (
										<Select
											id="product"
											label="Product"
											options={products}
											error={errors?.product?.message}
											value={getSelectValue(products, value)}
											ref={ref}
											onBlur={onBlur}
											defaultValue={getSelectValue(products, value)}
											handleOnChange={(e) => onChange(e as string)}
										/>
									)}
								/>
							</div>
						</div>
					}

					<div className="span-4">
						<Input
							id="name"
							type={FIELD.TEXT}
							label="Name"
							error={errors?.name?.message}
							{...register('name')}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="format"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									id="format"
									label="Format"
									options={formats}
									error={errors?.format?.message}
									value={getSelectValue(formats, value)}
									ref={ref}
									onBlur={onBlur}
									defaultValue={getSelectValue(formats, value)}
									handleOnChange={(e) => onChange(e as string)}
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
									disableGroupSeparators={true}
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

					<div className="span-12 grid gap-lg">
						{
							fields?.map((field, index) => (
								<div className="span-4" key={field.id}>
									<Controller
										name={`layer_seller.${index}`}
										control={control}
										render={({field: {value, ref, onChange, onBlur}}) => (
											<Select
												id={`layer_seller-${index + 1}`}
												label={`${index + 1}-${t('Layer')?.toLowerCase()}`}
												options={materials}
												top={true}
												handleDelete={() => remove(index)}
												value={getSelectValue(materials, value)}
												error={errors?.layer_seller?.[index]?.message}
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


						<div className="span-4" style={{marginTop: '2rem'}}>
							<Button
								theme={BUTTON_THEME.PRIMARY}
								type="button"
								disabled={(watch('layer_seller')?.length !== 0 && watch('layer_seller')?.[(watch('layer_seller')?.length ?? 1) - 1]?.toString()?.trim() === '') || fields.length >= 5}
								icon={<Plus/>}
								onClick={() => append('')}
							>
								Add layer
							</Button>
						</div>
					</div>


					<div className="span-12 grid gap-xl flex-0">
						<div className="span-4">
							<Controller
								name="count"
								control={control}
								render={({field}) => (
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
								name="deadline"
								control={control}
								render={({field}) => (
									<MaskInput
										id="deadline"
										label="Deadline"
										placeholder={getDate()}
										mask="99.99.9999"
										error={errors?.deadline?.message}
										{...field}
									/>
								)}
							/>
						</div>

						<div className="span-4">
							<Controller
								name="price"
								control={control}
								render={({field}) => (
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
								render={({field}) => (
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

						<div className="span-4">
							<Input
								id="comment"
								label={`Comment`}
								error={errors?.comment?.message}
								{...register(`comment`)}
							/>
						</div>
					</div>

				</Form>
			</Card>
		</>
	)
}

export default ProductPage