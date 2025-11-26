import {Button, Card, Form, Input, Loader, PageTitle, Select} from 'components'
import {useForm, useFieldArray, Controller} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useAdd, useData} from 'hooks'
import {useNavigate} from 'react-router-dom'
import * as yup from 'yup'
import {getSelectValue} from 'utilities/common'
import {ISelectOption} from 'interfaces/form.interface'


const schema = yup.object().shape({
	glue_type: yup.number().required(),
	amount: yup.string().required(),
	chemicals: yup.array().of(
		yup.object().shape({
			chemical: yup.number().required(),
			amount: yup.string().required()
		})
	),
	warehouse: yup
		.number()
		.transform(value => value ? Number(value) : null)
		.required('This field is required')
})

const GlueCreatePage = () => {
	const navigate = useNavigate()
	const {mutateAsync: add, isPending} = useAdd('chemicals/glue-create')
	const {data: warehouses = []} = useData<ISelectOption[]>('accounts/warehouses-select')

	const {
		data: glueTypeOptions = [],
		isLoading: glueTypeLoading
	} = useData<ISelectOption[]>('chemicals/glue-type-select')
	const {
		data: chemicalOptions = [],
		isLoading: chemicalLoading
	} = useData<ISelectOption[]>('chemicals/chemicals-select')

	const {
		control,
		handleSubmit,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			glue_type: undefined,
			amount: '',
			warehouse: undefined,
			chemicals: [{chemical: undefined, amount: ''}]
		}
	})

	const {fields, append, remove} = useFieldArray({control, name: 'chemicals'})


	if (glueTypeLoading || chemicalLoading) return <Loader/>

	return (
		<Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
			<PageTitle title="Create Glue" style={{marginBottom: '0'}}>
				<Button type="submit"
				        onClick={handleSubmit(async (data) => {
					        await add(data)
					        navigate(-1)
				        })} disabled={isPending}>Save</Button>
			</PageTitle>
			<Card style={{padding: '1.5rem'}} className="grid gap-xl">
				{/* Glue type select */}
				<div className="span-4">
					<Controller
						name="glue_type"
						control={control}
						render={({field: {value, ref, onChange, onBlur}}) => (
							<Select
								id="glue_type"
								label="Glue type"
								options={glueTypeOptions}
								error={errors?.glue_type?.message}
								value={getSelectValue(glueTypeOptions, value)}
								ref={ref}
								onBlur={onBlur}
								defaultValue={getSelectValue(glueTypeOptions, value)}
								handleOnChange={(e) => onChange((e as string))}
							/>
						)}
					/>
				</div>
				{/* Amount input */}
				<div className="span-4">
					<Controller
						name="amount"
						control={control}
						render={({field}) => (
							<Input id="amount" {...field} type="text" label="Amount" error={errors?.amount?.message}/>
						)}
					/>
				</div>

				<div className="span-4">
					<Controller
						name="warehouse"
						control={control}
						render={({field: {value, ref, onChange, onBlur}}) => (
							<Select
								id="warehouse"
								label="Material warehouse"
								options={warehouses}
								error={errors?.warehouse?.message}
								value={getSelectValue(warehouses, value)}
								ref={ref}
								onBlur={onBlur}
								defaultValue={getSelectValue(warehouses, value)}
								handleOnChange={(e) => onChange(e as string)}
							/>
						)}
					/>
				</div>

				{/* Chemicals list */}
				{fields.map((item, index) => (
					<div key={item.id} className="grid gap-lg">
						<div className="span-3">
							<Controller
								name={`chemicals.${index}.chemical`}
								control={control}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id={`chemicals.${index}.chemical`}
										label="Chemical"
										options={chemicalOptions?.map(i => ({
											...i,
											label: `${i?.label} (${i?.remaining_amount}/${i?.amount})`
										}))}
										error={errors?.chemicals?.[index]?.chemical?.message}
										value={getSelectValue(chemicalOptions?.map(i => ({
											...i,
											label: `${i?.label} (${i?.remaining_amount}/${i?.amount})`
										})), value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(chemicalOptions?.map(i => ({
											...i,
											label: `${i?.label} (${i?.remaining_amount}/${i?.amount})`
										})), value)}
										handleOnChange={(e) => onChange((e as string))}
									/>
								)}
							/>

						</div>
						<div className="span-3">
							<Controller
								name={`chemicals.${index}.amount`}
								control={control}
								render={({field}) => (
									<Input id={`chemicals.${index}.amount`} {...field} type="text" label="Amount"
									       error={errors?.chemicals?.[index]?.amount?.message}
									       handleDelete={() => remove(index)}
									/>
								)}
							/>

						</div>
					</div>
				))}

				<div className="span-12 grid gap-xl">
					<div className="span-4">
						<Button type="button"
						        onClick={() => append({chemical: undefined as unknown as number, amount: ''})}>
							Add glue
						</Button></div>
				</div>
			</Card>
		</Form>
	)
}

export default GlueCreatePage
