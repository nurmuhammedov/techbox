import {Plus} from 'assets/icons'
import React, {FC, useEffect} from 'react'
import {
	Button,
	Card,
	Form,
	Loader,
	PageTitle,
	NumberFormattedInput,
	Select, Input
} from 'components'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useForm, Controller, useFieldArray} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useAdd, useData, useDetail, useSearchParams, useUpdate} from 'hooks'
import {materialSchema, warehouseOrdersSchema} from 'helpers/yup'
import {decimalToInteger, getSelectValue} from 'utilities/common'
import {IBaseMaterialList, IMaterialItemDetail} from 'interfaces/materials.interface'
import {ISelectOption} from 'interfaces/form.interface'
import {useTranslation} from 'react-i18next'


interface IProperties {
	edit?: boolean;
}

const ProductPage: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {paramsObject: {created_at, format, material, warehouse}} = useSearchParams()
	const {t} = useTranslation()
	const {orderId: id = undefined, id: customer = undefined} = useParams()
	const {data: materials = []} = useData<ISelectOption[]>('products/materials/select')
	const {data: formats = []} = useData<ISelectOption[]>('products/formats/select')
	const {data: warehouses = []} = useData<ISelectOption[]>('accounts/warehouses-select')


	const {
		handleSubmit: orderHandleSubmit,
		control,
		reset: orderReset,
		watch: orderWatch,
		register: orderRegister,
		formState: {errors: orderErrors}
	} = useForm({
		resolver: yupResolver(warehouseOrdersSchema),
		mode: 'onTouched',
		defaultValues: {
			material: undefined,
			warehouse: undefined,
			format: undefined,
			weight: [{
				made_in: null,
				name: '',
				supplier: null,
				weight: undefined
			}]
		}
	})

	const {fields, append, remove} = useFieldArray({
		control,
		name: 'weight' as never
	})

	const {
		reset: resetAdd,
		control: controlAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {weight_1x1: ''},
		resolver: yupResolver(materialSchema)
	})


	const {mutateAsync: addOrder, isPending: isAdding} = useAdd('products/base-materials')
	const {mutateAsync: updateOrder, isPending: isUpdating} = useUpdate('products/base-materials/', id, 'patch')

	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IBaseMaterialList>('products/base-materials/', id, edit, {
		created_at,
		format_: format,
		material,
		warehouse
	})

	const {
		data: productDetail,
		isPending: isProductDetailLoading
	} = useDetail<IMaterialItemDetail>('products/materials/', orderWatch('material'), !!orderWatch('material'))

	useEffect(() => {
		if (productDetail && !isProductDetailLoading) {
			resetAdd({
				weight_1x1: productDetail.weight_1x1
			})
		}
	}, [productDetail, edit, resetAdd])

	useEffect(() => {
		if (detail && edit) {
			orderReset({
				material: detail.material?.id,
				warehouse: detail.warehouse?.id,
				weight: detail.weight,
				format: detail.format?.id
			})
		}
	}, [detail, edit, orderReset])


	if (isDetailLoading && edit) {
		return <Loader/>
	}

	return (
		<>
			<PageTitle title={edit ? 'Edit material' : 'Add material'}>
				<div className="flex justify-center gap-lg align-center">
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
					{
						!edit &&
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
													material: undefined,
													format: undefined,
													warehouse: undefined,
													weight: [{
														made_in: null,
														name: '',
														supplier: null,
														weight: undefined
													}]
												})
												navigate(-1)
											})
									)()
								} else {
									orderHandleSubmit((data) =>
										updateOrder({...data, customer})
											.then(async () => {
												orderReset({
													material: undefined,
													warehouse: undefined,
													format: undefined,
													weight: [{
														made_in: null,
														name: '',
														supplier: null,
														weight: undefined
													}]
												})
												navigate(-1)
											})
									)()
								}
							}}
						>
							{edit ? 'Edit' : 'Save'}
						</Button>
					}
				</div>
			</PageTitle>
			<Card style={{padding: '1.5rem'}}>
				<Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
					<div className="span-3">
						<Controller
							name="material"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									id="material"
									label="Material"
									options={materials}
									error={orderErrors?.material?.message}
									value={getSelectValue(materials, value)}
									ref={ref}
									isDisabled={edit}
									onBlur={onBlur}
									defaultValue={getSelectValue(materials, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>

					<div className="span-3">
						<Controller
							name="warehouse"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									id="warehouse"
									label="Material warehouse"
									options={warehouses}
									error={orderErrors?.warehouse?.message}
									value={getSelectValue(warehouses, value)}
									ref={ref}
									onBlur={onBlur}
									disabled={edit}
									defaultValue={getSelectValue(warehouses, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>

					<div className="span-3">
						<Controller
							name="format"
							control={control}
							render={({field: {value, ref, onChange, onBlur}}) => (
								<Select
									id="format"
									label="Format"
									options={formats}
									error={orderErrors?.format?.message}
									value={getSelectValue(formats, value)}
									ref={ref}
									isDisabled={edit}
									onBlur={onBlur}
									defaultValue={getSelectValue(formats, value)}
									handleOnChange={(e) => onChange(e as string)}
								/>
							)}
						/>
					</div>


					{
						(orderWatch('material') && productDetail) &&
						<>
							<div className="span-3">
								<Controller
									control={controlAdd}
									name="weight_1x1"
									render={({field}) => (
										<NumberFormattedInput
											id="weight_1x1"
											label={`${t('Weight 1x1')} (${t('gr')})`}
											disableGroupSeparators={true}
											maxLength={5}
											disabled={true}
											allowDecimals={false}
											error={addErrors?.weight_1x1?.message}
											{...field}
										/>
									)}
								/>
							</div>
						</>
					}

					<div className="span-12 grid gap-xl">

						{
							fields?.map((field, index) => (
								<React.Fragment key={field.id}>
									<div className="span-3">
										<Input
											id={`${index}.roll.name`}
											type={FIELD.TEXT}
											label={`${index + 1}-${t('Roll name')?.toLowerCase()}`}
											error={orderErrors?.weight?.[index]?.name?.message}
											disabled={edit}
											{...orderRegister(`weight.${index}.name`)}
										/>
									</div>
									<div className="span-3">
										<Controller
											control={control}
											name={`weight.${index}.weight`}
											render={({field}) => (
												<NumberFormattedInput
													id={`weight.${index + 1}.weight`}
													label={`${index + 1}-${t('Roll weight')?.toLowerCase()} (${t('kg')})`}
													disableGroupSeparators={false}
													maxLength={5}
													disabled={edit}
													allowDecimals={false}
													error={orderErrors?.weight?.[index]?.weight?.message}
													{...field}
												/>
											)}
										/>
									</div>
									<div className="span-3">
										<Input
											id={`${index}.roll.supplier`}
											type={FIELD.TEXT}
											label={`${t('Supplier')}`}
											disabled={edit}
											error={orderErrors?.weight?.[index]?.supplier?.message}
											{...orderRegister(`weight.${index}.supplier`)}
										/>
									</div>
									<div className="span-3">
										<Input
											id={`${index}.roll.made_in`}
											type={FIELD.TEXT}
											label={`${t('Country')}`}
											disabled={edit}
											error={orderErrors?.weight?.[index]?.made_in?.message}
											handleDelete={!edit ? () => remove(index) : undefined}
											{...orderRegister(`weight.${index}.made_in`)}
										/>
									</div>
								</React.Fragment>
							))
						}
					</div>
					{
						!edit &&
						<div className="span-12 grid gap-xl">
							<div className="span-4" style={{marginTop: '2rem'}}>
								<Button
									theme={BUTTON_THEME.PRIMARY}
									type="button"
									disabled={orderWatch('weight')?.length !== 0 && orderWatch('weight')?.[(orderWatch('weight')?.length ?? 1) - 1]?.toString()?.trim() === ''}
									icon={<Plus/>}
									onClick={() => append('')}
								>
									Add roll
								</Button>
							</div>
						</div>
					}
					<div className="span-12 grid gap-xl">
						<div className="span-6">

						</div>
						<div className="span-3">
							<Input
								id={`all.count`}
								type={FIELD.TEXT}
								label={t('Total count')}
								disabled={true}
								value={fields.length || 0}
							/>
						</div>
						<div className="span-3">
							<Input
								id={`all.weight`}
								type={FIELD.TEXT}
								label={`${t('Total weight')} (${t('kg')})`}
								disabled={true}
								value={decimalToInteger(orderWatch('weight')?.reduce((acc, item) => acc + Number(item?.weight || 0), 0)) || 0}
							/>
						</div>
					</div>
				</Form>
			</Card>
		</>
	)
}

export default ProductPage