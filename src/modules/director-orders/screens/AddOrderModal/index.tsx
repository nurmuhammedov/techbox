import { IFIle, ISelectOption } from 'interfaces/form.interface'
import { IOrderDetail } from 'interfaces/orders.interface'
import { FC, useEffect } from 'react'
import {
	Button,
	Form,
	Input,
	FileUpLoader,
	NumberFormattedInput,
	Select, Wrapper, MaskInput, Modal
} from 'components'
import { IProductDetail } from 'interfaces/products.interface'
import { BUTTON_THEME, FIELD } from 'constants/fields'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useActions, useAdd, useData, useDetail, useSearchParams, useTypedSelector } from 'hooks'
import { ordersSchema2 } from 'helpers/yup'
import { getSelectValue, modifyObjectField } from 'utilities/common'
import { Box, Plus } from 'assets/icons'
import { useTranslation } from 'react-i18next'
import { formatDateToISO, getDate } from 'utilities/date'
import { ISearchParams } from 'interfaces/params.interface'
import { InferType } from 'yup'


interface IProperties {
	edit?: boolean;
}

const ProductPage: FC<IProperties> = ({ edit = false }) => {
	const { t } = useTranslation()
	const { orders } = useTypedSelector(state => state.orders)
	const { data: products = [] } = useData<ISelectOption[]>('products/select')
	const { data: materials = [] } = useData<ISelectOption[]>('products/materials/select')
	const { data: formats = [] } = useData<ISelectOption[]>('products/formats/select')
	const { addOrder: add } = useActions()
	const { removeParams } = useSearchParams()

	const {
		handleSubmit,
		control,
		register,
		setValue,
		reset,
		watch,
		formState: { errors }
	} = useForm({
		resolver: yupResolver(ordersSchema2),
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
			layer: [undefined],
			logo: undefined
		}
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'layer' as never
	})

	const {
		mutateAsync: addOrder,
		isPending: isAdding
	} = useAdd<InferType<typeof ordersSchema2>, IOrderDetail, never>('services/orders')


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
				layer: productDetail?.layer || [undefined]
			}))
		}
	}, [productDetail, edit])


	useEffect(() => {
		if (orders?.length && watch('length') && watch('width')) {
			const count = orders[0]?.count_entered_leader || orders[0]?.count || 0
			const length = (2 * Number(orders[0]?.width || 0)) + 70 + (2 * Number(orders[0]?.length || 0))
			const length2 = (2 * Number(watch('width') || 0)) + 70 + (2 * Number(watch('length') || 0))

			setValue('count', Math.floor(Number(((Number(count) * length) / length2)))?.toString())

		}
	}, [watch('width'), watch('length')])

	return (
		<Modal title="Add order" id="addOrder" style={{ height: '60rem', width: '100rem' }}>
			<Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
				{
					!edit &&
					<div className="grid span-12 gap-xl flex-0">
						<div className="span-4">
							<Controller
								name="product"
								control={control}
								render={({ field: { value, ref, onChange, onBlur } }) => (
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
						render={({ field: { value, ref, onChange, onBlur } }) => (
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
						render={({ field }) => (
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
						render={({ field: { value, ref, onChange, onBlur } }) => (
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
						render={({ field }) => (
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
						render={({ field }) => (
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
						render={({ field }) => (
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
					<Box />
				</Wrapper>

				<div className="span-12 grid gap-lg">
					{
						fields?.map((field, index) => (
							<div className="span-4" key={field.id}>
								<Controller
									name={`layer.${index}`}
									control={control}
									render={({ field: { value, ref, onChange, onBlur } }) => (
										<Select
											id={`layer-${index + 1}`}
											label={`${index + 1}-${t('Layer')?.toLowerCase()}`}
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


					<div className="span-4" style={{ marginTop: '2rem' }}>
						<Button
							theme={BUTTON_THEME.PRIMARY}
							type="button"
							disabled={(watch('layer')?.length !== 0 && watch('layer')?.[(watch('layer')?.length ?? 1) - 1]?.toString()?.trim() === '') || fields.length >= 5}
							icon={<Plus />}
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
							render={({ field }) => (
								<NumberFormattedInput
									id="count"
									maxLength={9}
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
							render={({ field }) => (
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
							render={({ field }) => (
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
							render={({ field }) => (
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

				<Button
					type={FIELD.BUTTON}
					theme={BUTTON_THEME.PRIMARY}
					disabled={isAdding}
					onClick={() => {
						handleSubmit((data) =>
							addOrder(modifyObjectField({
								...data,
								deadline: formatDateToISO(data?.deadline as string | undefined),
								customer: null
							} as ISearchParams, 'logo') as InferType<typeof ordersSchema2>)
								.then((data) => {
									add({
										...data,
										format: { id: data?.format as unknown as number, format: '600', name: '11' }
									})
									reset({
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
										layer: [undefined],
										logo: undefined
									})
									removeParams('modal')
								})
						)()
					}}
				>
					Save
				</Button>
			</Form>
		</Modal>
	)
}

export default ProductPage