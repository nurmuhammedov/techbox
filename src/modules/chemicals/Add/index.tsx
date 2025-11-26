import {Button, Card, Form, Input, Loader, PageTitle, Select} from 'components'
import {useForm, useFieldArray, Controller} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useAdd, useData} from 'hooks'
import {useNavigate} from 'react-router-dom'
import * as yup from 'yup'
import {getSelectValue} from 'utilities/common'
import {ISelectOption} from 'interfaces/form.interface'


const schema = yup.object().shape({
	chemicals: yup.array().of(
		yup.object().shape({
			chemical_type: yup.number().required(),
			price: yup.string().required(),
			unity: yup.string().required(),
			amount: yup.string().required()
		})
	)
})

const options = [
	{value: 'l', label: 'L'},
	{value: 'kg', label: 'KG'}
]

const ChemicalsBulkCreatePage = () => {
	const navigate = useNavigate()
	const {mutateAsync: add, isPending} = useAdd('chemicals/chemicals-bulk-create')

	const {
		data: chemicalTypeOptions = [],
		isLoading
	} = useData<ISelectOption[]>('chemicals/chemical-type-select')

	const {
		control,
		handleSubmit,
		formState: {errors}
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			chemicals: [{chemical_type: undefined, price: '', amount: '', unity: undefined}]
		}
	})

	const {fields, append, remove} = useFieldArray({control, name: 'chemicals'})

	if (isLoading) return <Loader/>

	return (
		<Form className="grid gap-xl flex-0" onSubmit={(e) => e.preventDefault()}>
			<PageTitle title="Add chemicals" style={{marginBottom: '0'}}>
				<Button
					type="submit"
					onClick={handleSubmit(async (data) => {
						await add(data.chemicals) // backend bulk array
						navigate(-1)
					})}
					disabled={isPending}
				>
					Save
				</Button>
			</PageTitle>

			<Card style={{padding: '1.5rem'}} className="grid gap-xl">

				{/* Chemicals list */}
				{fields.map((item, index) => (
					<div key={item.id} className="grid gap-lg">
						<div className="span-3">

							{/* Chemical type select */}
							<Controller
								name={`chemicals.${index}.chemical_type`}
								control={control}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										id={`chemicals.${index}.chemical_type`}
										label="Chemical type"
										options={chemicalTypeOptions}
										error={errors?.chemicals?.[index]?.chemical_type?.message}
										value={getSelectValue(chemicalTypeOptions, value)}
										ref={ref}
										onBlur={onBlur}
										defaultValue={getSelectValue(chemicalTypeOptions, value)}
										handleOnChange={(e) => onChange((e as string))}
									/>
								)}
							/>
						</div>
						<div className="span-3">

							{/* Price input */}
							<Controller
								name={`chemicals.${index}.price`}
								control={control}
								render={({field}) => (
									<Input
										id={`chemicals.${index}.price`}
										{...field}
										type="text"
										label="Price"
										error={errors?.chemicals?.[index]?.price?.message}
									/>
								)}
							/>
						</div>
						<div className="span-3">

							<Controller
								name={`chemicals.${index}.amount`}
								control={control}
								render={({field}) => (
									<Input
										id={`chemicals.${index}.amount`}
										{...field}
										type="text"
										label="Amount"
										error={errors?.chemicals?.[index]?.amount?.message}
									/>
								)}
							/>
						</div>
						<div className="span-3">
							<Controller
								name={`chemicals.${index}.unity`}
								control={control}
								render={({field: {value, ref, onChange, onBlur}}) => (
									<Select
										ref={ref}
										id={`chemicals.${index}.unity`}
										handleDelete={() => remove(index)}
										label="Measure unit"
										options={options}
										onBlur={onBlur}
										error={errors?.chemicals?.[index]?.unity?.message}
										value={getSelectValue(options, value)}
										defaultValue={getSelectValue(options, value)}
										handleOnChange={(e) => onChange(e as string)}
									/>
								)}
							/>
						</div>
					</div>
				))}


				<div className="span-12 grid gap-xl">
					<div className="span-4">
						<Button
							type="button"
							onClick={() =>
								append({
									chemical_type: undefined as unknown as number,
									unity: undefined as unknown as string,
									price: '',
									amount: ''
								})
							}
						>
							Add chemicals
						</Button>
					</div>
				</div>
			</Card>
		</Form>
	)
}

export default ChemicalsBulkCreatePage
