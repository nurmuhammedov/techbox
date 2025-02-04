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

export {
	loginSchema,
	confirmPasswordSchema,
	positionsSchema,
	rolesSchema
}