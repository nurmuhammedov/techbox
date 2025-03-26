import {IFIle} from 'interfaces/form.interface'
import * as yup from 'yup'

// Login validation
const usernameSchema = yup
	.string()
	.trim()
	.required('This field is required')
	.min(5, 'Login must be at least 5 characters long')
	.max(30, 'Login must not exceed 30 characters')
	.matches(/^\S*$/, 'You cannot leave a space in the login')
	.matches(/^[a-zA-Z0-9_]+$/, 'The login can only contain letters, numbers, and underscores')
	.matches(/^(?!\d)[a-zA-Z0-9_]+$/, 'Login cannot start with a number')
	.matches(/^(?!_)[a-zA-Z0-9_]+(?<!_)$/, 'Login cannot begin or end with an underscore')
	.matches(/^(?!.*_{2})/, 'It is not possible to type consecutive underscores in a login')

// Password validation
const passwordSchema = yup
	.string()
	.trim()
	.required('This field is required')
	.min(8, 'Password must be at least 8 characters long')
	.max(30, 'Password must not exceed 30 characters')
	.matches(/^\S*$/, 'You cannot leave a space in the password')
	.matches(/^[a-zA-Z0-9!@#$%^&*()]+$/, 'Password can only contain letters, numbers, and special characters (!@#$%^&*)')

const dateField = yup
	.string()
	.length(10, 'The entered date is not valid')
	.transform((value) => {
		if (!value) return value
		const [day, month, year] = value.split('.')
		return `${year}-${month}-${day}`
	})
	.test('isValidDate', 'The entered date is not valid', (value) => {
		if (!value) return false
		const [year, month, day] = value.split('-').map(Number)
		const date = new Date(year, month - 1, day)
		return (
			date.getFullYear() === year &&
			date.getMonth() === month - 1 &&
			date.getDate() === day
		)
	})

// Confirm password validation
const confirmPasswordSchema = yup
	.string()
	.trim()
	.oneOf([yup.ref('password'), undefined], 'Passwords did not match')
	.required('This field is required')

// AUTHENTICATION
const loginSchema = yup.object().shape({
	username: usernameSchema,
	password: passwordSchema
})

// ROLES && POSITIONS
const rolesSchema = yup.object().shape({
	name: yup.string().trim().required('This field is required'),
	categories: yup.array().required('This field is required'),
	comment: yup.string().transform(v => !v ? null : v).nullable()
})

const positionsSchema = yup.object().shape({
	name: yup.string().trim().required('This field is required'),
	experience: yup.string().trim().required('This field is required')
})


// EMPLOYEES
const employeeSchema = yup.object().shape({
	lastname: yup.string().trim().required('This field is required'),
	firstname: yup.string().trim().required('This field is required'),
	middle_name: yup.string().trim().required('This field is required'),
	pinfl: yup.string().trim().required('This field is required').length(14, 'The entered date is not valid'),
	card_number: yup
		.string()
		.trim()
		.required('This field is required')
		.length(16, 'The entered date is not valid')
		.transform((value) => {
			if (typeof value === 'string') {
				return value.split(' ').join('')
			}
			return value
		}),
	passport: yup
		.string()
		.trim()
		.required('This field is required')
		.length(10, 'The entered date is not valid')
		.transform((value) => {
			if (typeof value === 'string') {
				return value.toUpperCase()
			}
			return value
		}),
	address: yup.string().trim().required('This field is required'),
	phone: yup.string().trim().required('This field is required').length(17, 'The entered date is not valid'),
	position: yup.number().required('This field is required'),
	birthday: dateField.required('This field is required').test('isNotFutureDate', 'How are you going to include someone who is not born?', (value) => {
		if (!value) return false
		const [year, month, day] = value.split('-').map(Number)
		const inputDate = new Date(year, month - 1, day)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return inputDate <= today
	})
})

const userSchema = yup.object().shape({
	employee: yup.number().required('This field is required'),
	role: yup.number().required('This field is required'),
	username: usernameSchema,
	password: passwordSchema,
	password_confirm: confirmPasswordSchema
})

const userUpdateSchema = yup.object().shape({
	role: yup.number().required('This field is required'),
	username: usernameSchema
})

// MATERIALS
const materialSchema = yup.object().shape({
	name: yup
		.string()
		.trim()
		.required('This field is required'),
	weight_1x1: yup
		.string()
		.trim()
		.required('This field is required')
	// weight: yup
	// 	.string()
	// 	.trim()
	// 	.required('This field is required')
	// format: yup
	// 	.string()
	// 	.trim()
	// 	.required('This field is required')
})

const formatSchema = yup.object().shape({
	format: yup
		.string()
		.trim()
		.required('This field is required')
})

// WAREHOUSE
const warehouseSchema = yup.object().shape({
	name: yup
		.string()
		.trim()
		.required('This field is required'),
	address: yup
		.string()
		.trim()
		.required('This field is required'),
	area: yup
		.string()
		.trim()
		.required('This field is required')
})

const semiFinishedWarehouseSchema = yup.object().shape({
	name: yup
		.string()
		.trim()
		.required('This field is required'),
	area: yup
		.string()
		.trim()
		.required('This field is required')
})

const warehouseOrdersSchema = yup.object().shape({
	material: yup
		.number()
		.transform(value => value ? Number(value) : null)
		.required('This field is required'),
	warehouse: yup
		.number()
		.transform(value => value ? Number(value) : null)
		.required('This field is required'),
	// count: yup
	// 	.string()
	// 	.trim()
	// 	.required('This field is required'),
	weight: yup
		.array()
		.default(['0'])
		.of(yup.string().trim().required('This field is required'))
		.required('This field is required'),
	format: yup
		.number()
		.required('This field is required')
})


// PRODUCTS
const productSchema = yup.object().shape({
	name: yup
		.string()
		.trim()
		.required('This field is required')
		.max(100, 'Must not exceed 100 characters'),
	width: yup
		.string()
		.trim()
		.required('This field is required'),
	height: yup
		.string()
		.trim()
		.required('This field is required'),
	length: yup
		.string()
		.trim()
		.required('This field is required'),
	box_ear: yup
		.string()
		.trim()
		.required('This field is required'),
	format: yup
		.number()
		.required('This field is required'),
	logo: yup
		.object<IFIle>()
		.shape({
			name: yup.string().nullable(),
			id: yup.number().nullable(),
			file: yup.string().nullable()
		})
		.nullable()
		.notRequired(),
	layer: yup
		.array()
		.of(yup.string().trim().required('This field is required'))
		.nullable()
		.transform(value => value?.length > 0 ? value : null)
})

// ORDERS
const ordersSchema = yup.object().shape({
	product: yup
		.number()
		.nullable(),
	count: yup
		.string()
		.trim()
		.required('This field is required'),
	comment: yup
		.string()
		.trim()
		.required('This field is required'),
	price: yup
		.string()
		.trim()
		.required('This field is required'),
	money_paid: yup
		.string()
		.trim()
		.required('This field is required'),
	name: yup
		.string()
		.trim()
		.required('This field is required')
		.max(100, 'Must not exceed 100 characters'),
	width: yup
		.string()
		.trim()
		.required('This field is required'),
	height: yup
		.string()
		.trim()
		.required('This field is required'),
	length: yup
		.string()
		.trim()
		.required('This field is required'),
	box_ear: yup
		.string()
		.trim()
		.required('This field is required'),
	format: yup
		.number()
		.required('This field is required'),
	logo: yup
		.object<IFIle>()
		.shape({
			name: yup.string().nullable(),
			id: yup.number().nullable(),
			file: yup.string().nullable()
		})
		.nullable()
		.notRequired(),
	layer: yup
		.array()
		.of(yup.string().trim().required('This field is required'))
		.nullable()
		.transform(value => value?.length > 0 ? value : null),
	deadline: dateField.required('This field is required')
})

const groupOrdersSchema = yup.object().shape({
	has_addition: yup.boolean().nullable(),
	gofra: yup.boolean().nullable(),
	ymo1: yup.boolean().nullable(),
	fleksa: yup.boolean().nullable(),
	ymo2: yup.boolean().nullable(),
	tikish: yup.boolean().nullable(),
	yelimlash: yup.boolean().nullable(),
	x: yup
		.string()
		.trim()
		.transform(value => value ? value : null)
		.when('has_addition', {
			is: true,
			then: (schema) => schema.required('This field is required'),
			otherwise: (schema) => schema.nullable()
		}),
	y: yup
		.string()
		.trim()
		.transform(value => value ? value : null)
		.when('has_addition', {
			is: true,
			then: (schema) => schema.required('This field is required'),
			otherwise: (schema) => schema.nullable()
		}),
	deadline: yup
		.string()
		.when('has_addition', {
			is: true,
			then: (schema) => schema
				.required('This field is required')
				.length(10, 'The entered date is not valid')
				.transform((value) => {
					if (!value) return value
					const [day, month, year] = value.split('.')
					return `${year}-${month}-${day}`
				})
				.test('isValidDate', 'The entered date is not valid', (value) => {
					if (!value) return false
					const [year, month, day] = value.split('-').map(Number)
					const date = new Date(year, month - 1, day)
					return (
						date.getFullYear() === year &&
						date.getMonth() === month - 1 &&
						date.getDate() === day
					)
				}),
			otherwise: (schema) => schema
				.nullable()
				.optional()
		}),
	count: yup
		.string()
		.trim()
		.when('has_addition', {
			is: true,
			then: (schema) => schema.required('This field is required'),
			otherwise: (schema) => schema
				.transform(value => value ? value : null)
				.nullable()
		}),
	separated_raw_materials_format: yup
		.number()
		.required('This field is required')
})

const temporaryOrderSchema = yup.object().shape({
	// count: yup
	// 	.string()
	// 	.trim()
	// 	.required('This field is required'),
	gofra: yup.boolean().nullable(),
	ymo1: yup.boolean().nullable(),
	fleksa: yup.boolean().nullable(),
	ymo2: yup.boolean().nullable(),
	tikish: yup.boolean().nullable(),
	yelimlash: yup.boolean().nullable(),
	l0: yup
		.string()
		.trim()
		.required('This field is required'),
	l1: yup
		.string()
		.trim()
		.required('This field is required'),
	l2: yup
		.string()
		.trim()
		.required('This field is required'),
	l3: yup
		.string()
		.trim()
		.required('This field is required'),
	l4: yup
		.string()
		.trim()
		.required('This field is required'),
	l5: yup
		.string()
		.trim()
		.required('This field is required'),
	layer: yup
		.array()
		.of(yup.string().trim().required('This field is required'))
		.nullable(),
	deadline: dateField.required('This field is required')
})

const operatorOrderSchema = yup.object().shape({
	warehouse: yup
		.number()
		.transform(value => value ? Number(value) : null)
		.required('This field is required'),
	data: yup
		.array()
		.of(yup.object().shape({
			material: yup.number().required('This field is required'),
			weight: yup.string().trim().required('This field is required')
		}))
		.required('This field is required')
})

const operatorsOrderSchema = yup.object().shape({
	percentage: yup
		.string()
		.trim()
		.required('This field is required'),
	weight: yup
		.string()
		.trim()
		.required('This field is required'),
	warehouse: yup
		.number()
		.transform(value => value ? Number(value) : null)
		.required('This field is required'),
	area: yup
		.string()
		.trim()
		.required('This field is required'),
	data: yup
		.array()
		.of(yup.object().shape({
			order: yup.number().required('This field is required'),
			count: yup.string().trim().required('This field is required')
		}))
		.required('This field is required')
})

const flexOperatorsOrderSchema = yup.object().shape({
	percentage: yup
		.string()
		.trim()
		.required('This field is required'),
	weight: yup
		.string()
		.trim()
		.required('This field is required'),
	warehouse: yup
		.number()
		.transform(value => value ? Number(value) : null)
		.required('This field is required'),
	area: yup
		.string()
		.trim()
		.required('This field is required'),
	count: yup.string().trim().required('This field is required')
})

// CLIENTS
const clientsSchema = yup.object().shape({
	company_name: yup.string().trim().required('This field is required'),
	fullname: yup.string().trim().required('This field is required'),
	stir: yup.string().trim().nullable().transform(value => value ? value : null).length(9, 'The entered date is not valid'),
	phone: yup.string().trim().required('This field is required').length(17, 'The entered date is not valid'),
	partnership_year: yup.string().trim().required('This field is required')
})

export {
	semiFinishedWarehouseSchema,
	flexOperatorsOrderSchema,
	confirmPasswordSchema,
	warehouseOrdersSchema,
	operatorsOrderSchema,
	temporaryOrderSchema,
	operatorOrderSchema,
	groupOrdersSchema,
	userUpdateSchema,
	positionsSchema,
	warehouseSchema,
	employeeSchema,
	materialSchema,
	productSchema,
	clientsSchema,
	formatSchema,
	ordersSchema,
	loginSchema,
	rolesSchema,
	userSchema
}