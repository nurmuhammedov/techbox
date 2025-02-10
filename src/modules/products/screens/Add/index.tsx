import {ISelectOption} from 'interfaces/form.interface'
import {FC, useEffect} from 'react'
import {
	Button,
	Card,
	Form,
	Input,
	Loader,
	PageTitle,
	FileUpLoader,
	NumberFormattedInput, Select
} from 'components'
import {IProductDetail} from 'interfaces/products.interface'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useForm, Controller, useFieldArray} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useAdd, useData, useDetail, useUpdate} from 'hooks'
import {productSchema} from 'helpers/yup'
import {getSelectValue} from 'utilities/common'


interface IProperties {
	edit?: boolean;
}

const ProductPage: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {id} = useParams()
	const {data: materials = []} = useData<ISelectOption[]>('products/materials/select')

	const {
		handleSubmit,
		control,
		register,
		reset,
		watch,
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
			layerCount: '1',
			layers: [{material: undefined, queue: 1}],
			logo: undefined
		}
	})

	const {mutateAsync: addProduct, isPending: isAdding} = useAdd('products/')
	const {mutateAsync: updateProduct, isPending: isUpdating} = useUpdate('products/', id)
	const {data, isPending: isDetailLoading} = useDetail<IProductDetail>('products/', id, edit)

	useEffect(() => {
		if (data && edit) {
			reset({
				name: data.name,
				width: data.width,
				height: data.height,
				length: data.length,
				box_ear: data.box_ear,
				format: data.format,
				logo: data.logo || undefined,
				layerCount: data.layers.length > 0 ? String(data.layers.length) : String(1),
				layers: data.layers.length > 0 ? data.layers : [{material: 0, queue: 1}]
			})
		}
	}, [data, edit, reset])

	const layerCount = Number(watch('layerCount') || 1)

	const {fields, append, remove} = useFieldArray({
		control,
		name: 'layers'
	})


	useEffect(() => {
		const currentLayers = fields.length
		const desiredLayers = layerCount

		if (desiredLayers > currentLayers) {
			for (let i = currentLayers; i < desiredLayers; i++) {
				append({material: 0, queue: i + 1})
			}
		} else if (desiredLayers < currentLayers) {
			for (let i = currentLayers; i > desiredLayers; i--) {
				remove(i - 1)
			}
		}
	}, [layerCount])


	if (isDetailLoading && edit) {
		return <Loader screen/>
	}

	return (
		<>
			<PageTitle title={edit ? 'Edit Product' : 'Add Product'}>
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
									addProduct(data)
										.then(async () => {
											reset()
											navigate(-1)
										})
								)()
							} else {
								handleSubmit((data) =>
									updateProduct(data)
										.then(async () => {
											reset()
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
							control={control}
							name="width"
							render={({field}) => (
								<NumberFormattedInput
									id="width"
									maxLength={3}
									disableGroupSeparators
									allowDecimals={false}
									label="Width"
									error={errors?.width?.message}
									{...field}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							control={control}
							name="height"
							render={({field}) => (
								<NumberFormattedInput
									id="height"
									maxLength={3}
									disableGroupSeparators
									allowDecimals={false}
									label="Height"
									error={errors?.height?.message}
									{...field}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							control={control}
							name="length"
							render={({field}) => (
								<NumberFormattedInput
									id="length"
									maxLength={3}
									disableGroupSeparators
									allowDecimals={false}
									label="Length"
									error={errors?.length?.message}
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
									disableGroupSeparators
									allowDecimals={false}
									label="Box ear"
									error={errors?.box_ear?.message}
									{...field}
								/>
							)}
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
									disableGroupSeparators
									allowDecimals={false}
									label="Format"
									error={errors?.format?.message}
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
									multi={true}
									value={value}
									onBlur={onBlur}
									onChange={onChange}
									label="Logo"
									error={errors?.logo?.message}
								/>
							)}
						/>
					</div>

					<div className="span-4">
						<Controller
							name="layerCount"
							control={control}
							render={({field}) => (
								<NumberFormattedInput
									id="layerCount"
									maxLength={1}
									disableGroupSeparators
									allowDecimals={false}
									label="Layer count"
									error={errors?.layerCount?.message}
									{...field}
								/>
							)}
						/>
					</div>

					{fields.map((field, index) => (
						<div className="span-4" key={field.id}>
							<Controller
								name={`layers.${index}.material`}
								control={control}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id={`layer-${index + 1}`}
										label={`Layer ${index + 1}`}
										top={true}
										options={materials}
										error={errors?.layers?.[index]?.material?.message}
										value={getSelectValue(materials, value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(materials, value)}
										handleOnChange={(e) => onChange({
											material: e as string,
											queue: index
										})}
									/>
								)}
							/>
						</div>
					))}

				</Form>
			</Card>
		</>
	)
}

export default ProductPage