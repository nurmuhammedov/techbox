import * as yup from 'yup'

// AUTHENTICATION
const loginSchema = yup.object().shape({
	username: yup.string()
		.trim()
		.required('This field is required')
		.min(6, 'Login must be at least 5 characters long')
		.max(20, 'Login must not exceed 20 characters'),
	password: yup.string()
		.trim()
		.required('This field is required')
		.min(3, 'Password must be at least 8 characters long')
		.max(30, 'Password must not exceed 30 characters')
})


export {
	loginSchema
}