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
	Select, Wrapper
} from 'components'
import {IProductDetail} from 'interfaces/products.interface'
import {useNavigate, useParams} from 'react-router-dom'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useForm, Controller, useFieldArray} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useAdd, useData, useDetail, useUpdate} from 'hooks'
import {productSchema} from 'helpers/yup'
import {getSelectValue, modifyObjectField} from 'utilities/common'
import {Box, Plus} from 'assets/icons'
import {ISearchParams} from 'interfaces/params.interface'
import {useTranslation} from 'react-i18next'


interface IProperties {
	edit?: boolean;
}

const ProductPage: FC<IProperties> = ({edit = false}) => {
	const navigate = useNavigate()
	const {t} = useTranslation()
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
			layer: [],
			logo: undefined
		}
	})

	const {fields, append, remove} = useFieldArray({
		control,
		name: 'layer' as never
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
				layer: data?.layer || []
			})
		}
	}, [data, edit, reset])


	if (isDetailLoading && edit) {
		return <Loader screen/>
	}

	return (
		<>
			<PageTitle title={edit ? 'Edit product' : 'Add product'}>
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
									addProduct(modifyObjectField(data as ISearchParams, 'logo'))
										.then(async () => {
											reset()
											navigate(-1)
										})
								)()
							} else {
								handleSubmit((data) =>
									updateProduct(modifyObjectField(data as ISearchParams, 'logo'))
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
							name="format"
							control={control}
							render={({field}) => (
								<NumberFormattedInput
									id="format"
									maxLength={3}
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
									disableGroupSeparators
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
											error={errors?.layer?.[index]?.message}
											handleDelete={() => remove(index)}
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

					<div className="span-4" style={{marginTop: '2rem'}}>
						<Button
							theme={BUTTON_THEME.PRIMARY}
							type="button"
							disabled={watch('layer')?.length !== 0 && watch('layer')?.[(watch('layer')?.length ?? 1) - 1]?.toString()?.trim() === ''}
							icon={<Plus/>}
							onClick={() => append('')}
						>
							Add layer
						</Button>
					</div>
				</Form>
			</Card>
		</>
	)
}

export default ProductPage