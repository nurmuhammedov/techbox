import {Button, Card, DatePicker, Form, Input, NumberFormattedInput, PageTitle, Select} from 'components'
import {BUTTON_THEME, FIELD} from 'constants/fields'
import {useAdd, useData} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'
import {getSelectValue} from 'utilities/common'
import {driverLabel, transportLabel} from '../helpers'


type Row = Record<string, any>

const toOptions = (rows: Row[] = [], label: (r: Row) => string): ISelectOption[] =>
	rows.map(r => ('value' in r ? r as ISelectOption : {value: r.id, label: label(r)}))

const AddShipment = () => {
	const navigate = useNavigate()
	const {data: sales = []} = useData<Row[]>('logistics/shipments/sold-orders')
	const {data: warehouses = []} = useData<ISelectOption[]>('accounts/warehouses-select')
	const {data: transports = []} = useData<Row[]>('logistics/transports/select')
	const {data: drivers = []} = useData<Row[]>('logistics/drivers/select')

	const {handleSubmit, control, register, watch, setValue, setError, formState: {errors}} = useForm<Row>({
		defaultValues: {
			sold_order: undefined,
			quantity: '',
			weight: '',
			warehouse: undefined,
			client_factory: undefined,
			destination_address: '',
			planned_date: null,
			planned_time: '',
			transport: undefined,
			driver: undefined,
			phone: ''
		}
	})

	const saleId = watch('sold_order')
	const sale = useMemo(() => (sales as Row[]).find(s => s.id === Number(saleId)), [sales, saleId])
	const {data: factories = []} = useData<Row[]>('logistics/client-factories/select', !!sale?.customer, {customer: sale?.customer})
	const factoryId = watch('client_factory')

	useEffect(() => {
		if (sale) setValue('quantity', String(sale.remaining))
	}, [sale, setValue])

	useEffect(() => {
		const factory = (factories as Row[]).find(f => f.id === Number(factoryId))
		if (factory) {
			setValue('destination_address', factory.address || '')
			if (factory.phone) setValue('phone', factory.phone)
		}
	}, [factoryId, factories, setValue])

	const {mutateAsync, isPending} = useAdd('logistics/shipments')

	const saleOptions = useMemo(() => (sales as Row[]).map(s => ({
		value: s.id,
		label: `${s.customer_name} — ${s.order_name}${s.dimensions ? ` (${s.dimensions})` : ''} · qolgan ${s.remaining} dona`
	})), [sales])
	const factoryOptions = toOptions(factories as Row[], r => `${r.name} — ${r.address}`)
	const transportOptions = toOptions(transports as Row[], transportLabel)
	const driverOptions = toOptions(drivers as Row[], driverLabel)

	const submit = (values: Row) => {
		if (!values.sold_order) return setError('sold_order', {message: 'Sotuvni tanlang'})
		const quantity = Number(values.quantity)
		if (!quantity) return setError('quantity', {message: 'Miqdorni kiriting'})
		if (sale && quantity > sale.remaining) {
			return setError('quantity', {message: `Sotuvdan ${sale.remaining} dona qolgan`})
		}
		if (!values.destination_address) return setError('destination_address', {message: 'Manzilni kiriting'})
		const payload = Object.fromEntries(Object.entries({
			...values,
			quantity,
			weight: values.weight ? Number(values.weight) : undefined,
			planned_time: values.planned_time || undefined
		}).filter(([, v]) => v !== undefined && v !== '' && v !== null))
		mutateAsync(payload).then((created: any) => navigate(created?.id ? `/shipments/${created.id}` : '/shipments', {replace: true}))
	}

	const select = (name: string, label: string, options: ISelectOption[], span = 4) => (
		<div className={`span-${span}`}>
			<Controller
				name={name}
				control={control}
				render={({field: {value, onChange}}) => (
					<Select
						id={name}
						label={label}
						options={options}
						error={errors?.[name]?.message as string}
						value={getSelectValue(options, value)}
						defaultValue={getSelectValue(options, value)}
						handleOnChange={(e) => onChange(e)}
					/>
				)}
			/>
		</div>
	)

	return (
		<>
			<PageTitle title="Yangi jo‘natma">
				<div className="flex gap-lg">
					<Button theme={BUTTON_THEME.OUTLINE} onClick={() => navigate(-1)}>Orqaga</Button>
					<Button type={FIELD.BUTTON} disabled={isPending} onClick={handleSubmit(submit)}>Saqlash</Button>
				</div>
			</PageTitle>
			<Card style={{padding: '1.5rem'}}>
				<Form className="grid gap-xl" onSubmit={e => e.preventDefault()}>
					{select('sold_order', 'Sotuv (mijoz va mahsulot)', saleOptions, 8)}
					<div className="span-2">
						<Controller
							name="quantity"
							control={control}
							render={({field}) => (
								<NumberFormattedInput id="quantity" label="Miqdori (dona)" error={errors?.quantity?.message as string} {...field}/>
							)}
						/>
					</div>
					<div className="span-2">
						<Controller
							name="weight"
							control={control}
							render={({field}) => (
								<NumberFormattedInput id="weight" label="Og‘irligi (kg)" allowDecimals={true} {...field}/>
							)}
						/>
					</div>
					{select('warehouse', 'Ombor', warehouses as ISelectOption[])}
					{select('client_factory', sale ? 'Mijoz zavodi' : 'Mijoz zavodi (avval sotuvni tanlang)', factoryOptions)}
					<div className="span-4">
						<Input
							id="destination_address"
							label="Yetkazish manzili"
							error={errors?.destination_address?.message as string}
							{...register('destination_address')}
						/>
					</div>
					<div className="span-4">
						<Controller
							name="planned_date"
							control={control}
							render={({field: {value, onChange, onBlur, ref}}) => (
								<DatePicker ref={ref} id="planned_date" label="Yetkazish sanasi" value={value} onChange={onChange} onBlur={onBlur}/>
							)}
						/>
					</div>
					<div className="span-4">
						<Input id="planned_time" label="Vaqti (masalan 10:00)" {...register('planned_time')}/>
					</div>
					<div className="span-4">
						<Input id="phone" label="Qabul qiluvchi telefoni" {...register('phone')}/>
					</div>
					{select('transport', 'Mashina (ixtiyoriy, yuklashda ham tanlanadi)', transportOptions, 6)}
					{select('driver', 'Haydovchi (ixtiyoriy)', driverOptions, 6)}
				</Form>
			</Card>
		</>
	)
}

export default AddShipment
