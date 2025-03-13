import {ISearchParams} from 'interfaces/params.interface'
import {IProductDetail} from 'interfaces/products.interface'
import {FC, useEffect} from 'react'
import {
	Button,
	Card,
	Form,
	Input,
	PageTitle,
	FileUpLoader,
	NumberFormattedInput,
	Select,
	MaskInput, Wrapper
} from 'components'
import {useNavigate} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useForm, Controller, useFieldArray} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useAdd, useData, useDetail} from 'hooks'
import {ordersSchema} from 'helpers/yup'
import {clientsSchema} from 'helpers/yup'
import {getSelectValue, modifyObjectField} from 'utilities/common'
import {Box, Plus} from 'assets/icons'
import {useTranslation} from 'react-i18next'
import {IFIle, ISelectOption} from 'interfaces/form.interface'
import {generateYearList, getDate} from 'utilities/date'
import {InferType} from 'yup'


const CombinedCreatePage: FC = () => {
	const navigate = useNavigate()
	const {t} = useTranslation()


	const {data: products = []} = useData<ISelectOption[]>('products/select')
	const {data: materials = []} = useData<ISelectOption[]>('products/materials/select')
	const {data: formats = []} = useData<ISelectOption[]>('products/formats/select')

	// Customer Form
	const {
		handleSubmit: handleCustomerSubmit,
		control: customerControl,
		register: customerRegister,
		reset: customerReset,
		formState: {errors: customerErrors}
	} = useForm({
		resolver: yupResolver(clientsSchema),
		mode: 'onTouched',
		defaultValues: {
			company_name: '',
			fullname: '',
			partnership_year: undefined,
			phone: '',
			stir: ''
		}
	})

	// Order Form
	const {
		handleSubmit: handleOrderSubmit,
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
			name: '',
			width: '',
			height: '',
			length: '',
			box_ear: '',
			format: undefined,
			layer: [],
			logo: undefined
		}
	})

	const {fields, append, remove} = useFieldArray({
		control: control,
		name: 'layer' as never
	})

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
				layer: productDetail?.layer || [' ']
			}))
		}
	}, [productDetail])


	const {mutateAsync: addCustomer, isPending: isAddingCustomer} =
		useAdd<InferType<typeof clientsSchema>, { id: number }, unknown>('services/customers')
	const {mutateAsync: addOrder, isPending: isAddingOrder} = useAdd('services/orders')

	const onSubmit = async (customerData: InferType<typeof clientsSchema>, orderData: InferType<typeof ordersSchema>) => {
		try {
			const customerResponse = await addCustomer(customerData)
			const customerId = customerResponse.id

			const orderPayload = {
				...orderData,
				customer: customerId
			}
			await addOrder(modifyObjectField(orderPayload as ISearchParams, 'logo'))

			customerReset()
			reset()
			navigate(-1)
		} catch (error) {
			console.error('Error creating customer or order:', error)
		}
	}

	const handleCombinedSubmit = () => {
		handleCustomerSubmit((customerData) => {
			handleOrderSubmit((orderData) => onSubmit(customerData, orderData))()
		})()
	}


	return (
		<>
			<PageTitle title="Add order">
				<div className="flex justify-center gap-lg align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					<Button
						type={FIELD.BUTTON}
						theme={BUTTON_THEME.PRIMARY}
						disabled={isAddingCustomer || isAddingOrder}
						onClick={handleCombinedSubmit}
					>
						Save
					</Button>
				</div>
			</PageTitle>


			<Card style={{padding: '1.5rem', marginBottom: '2rem'}}>
				<Form className="grid gap-xl" onSubmit={(e) => e.preventDefault()}>
					<div className="span-4">
						<Input
							id="company_name"
							type={FIELD.TEXT}
							label="Company name"
							error={customerErrors?.company_name?.message}
							{...customerRegister('company_name')}
						/>
					</div>
					<div className="span-4">
						<Input
							id="fullname"
							type={FIELD.TEXT}
							label="Full name"
							error={customerErrors?.fullname?.message}
							{...customerRegister('fullname')}
						/>
					</div>
					<div className="span-4">
						<Controller
							name="phone"
							control={customerControl}
							render={({field}) => (
								<MaskInput
									id="phone"
									label="Phone number"
									error={customerErrors?.phone?.message}
									{...field}
								/>
							)}
						/>
					</div>
					<div className="span-4">
						<Controller
							name="partnership_year"
							control={customerControl}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									ref={ref}
									id="partnership_year"
									options={generateYearList(1990)}
									onBlur={onBlur}
									label="Partnership year"
									error={customerErrors?.partnership_year?.message}
									value={getSelectValue(generateYearList(1990), value)}
									defaultValue={getSelectValue(generateYearList(1990), value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>
					<div className="span-4">
						<Controller
							control={customerControl}
							name="stir"
							render={({field}) => (
								<NumberFormattedInput
									id="stir"
									maxLength={9}
									disableGroupSeparators={true}
									allowDecimals={false}
									label="TIN"
									error={customerErrors?.stir?.message}
									{...field}
								/>
							)}
						/>
					</div>
				</Form>
			</Card>

			{/* Order Form Card */}
			<Card style={{padding: '1.5rem'}}>
				<Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>

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
										name={`layer.${index}`}
										control={control}
										render={({field: {value, ref, onChange, onBlur}}) => (
											<Select
												id={`layer-${index + 1}`}
												label={`${index + 1}-${t('layer')}`}
												options={materials}
												top={true}
												handleDelete={() => remove(index)}
												value={getSelectValue(materials, value)}
												error={errors?.layer?.[index]?.message}
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
								disabled={(watch('layer')?.length !== 0 && watch('layer')?.[(watch('layer')?.length ?? 1) - 1]?.toString()?.trim() === '') || fields.length >= 5}
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
										maxLength={4}
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

export default CombinedCreatePage