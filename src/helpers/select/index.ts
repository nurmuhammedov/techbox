import {
	DropdownIndicatorProps,
	CSSObjectWithLabel,
	ControlProps,
	OptionProps
} from 'react-select'


const getSelectStyles = (error?: boolean, top?: boolean) => ({
	'control': (base: CSSObjectWithLabel, state: ControlProps) => ({
		...base,
		border: error ? '1px solid var(--red)' : state.isFocused ? '1px solid var(--primary-blue)' : '1px solid transparent',
		boxShadow: error ? '0 0 0 1px var(--red)' : state.isFocused ? '0 0 0 1px var(--primary-blue)' : 'none',
		backgroundColor: 'var(--gray-lightest)',
		padding: '.75rem',
		borderRadius: '0.625rem',
		fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
		fontSize: '1rem',
		fontWeight: '400',
		lineHeight: '150%',
		letterSpacing: '0.05625rem',
		color: 'var(--navy-dark)',
		width: '100%',
		cursor: 'pointer',
		outline: 'none',
		transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
		'&:hover': {
			borderColor: state.isFocused ? error ? 'var(--red)' : 'var(--primary-blue)' : 'transparent'
		}
	}),
	'placeholder': (base: CSSObjectWithLabel) => ({
		...base,
		color: 'var(--gray-light)',
		fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
		fontSize: '1rem',
		fontWeight: '400',
		lineHeight: '150%',
		letterSpacing: '0.05625rem'
	}),
	'singleValue': (base: CSSObjectWithLabel) => ({
		...base,
		color: 'var(--navy-dark)'
	}),
	'input': (base: CSSObjectWithLabel) => ({
		...base,
		padding: 0,
		margin: 0,
		color: 'var(--navy-dark)'
	}),
	'dropdownIndicator': (base: CSSObjectWithLabel, state: DropdownIndicatorProps) => ({
		...base,
		transition: 'all 0.3s ease-out',
		transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : null
	}),
	'menu': (base: CSSObjectWithLabel) => ({
		...base,
		zIndex: '11',
		top: top ? 'auto' : 'calc(100% + 0.3rem)',
		backgroundColor: 'var(--gray-lightest)',
		borderRadius: '0.625rem',
		padding: '0.1rem 0',
		overflow: 'hidden',
		minWidth: '100%'
	}),
	'menuList': (base: CSSObjectWithLabel) => ({
		...base,
		margin: 0
	}),
	'option': (base: CSSObjectWithLabel, state: OptionProps) => ({
		...base,
		fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
		padding: '.75rem',
		fontWeight: '400',
		lineHeight: '150%',
		letterSpacing: '0.05625rem',
		display: 'flex',
		alignItems: 'center',
		color: state.isSelected || state.isFocused ? 'var(--white)' : 'var(--navy-dark)',
		backgroundColor: state.isSelected || state.isFocused ? 'var(--primary-blue)' : 'transparent',
		cursor: 'pointer',
		transition: 'all ease-in-out 0.1s',
		'&:active': {
			backgroundColor: state.isSelected || state.isFocused ? 'var(--primary-blue)' : 'transparent'
		}
	}),
	'noOptionsMessage': (base: CSSObjectWithLabel) => ({
		...base,
		padding: '0.8rem 1rem',
		fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
		fontSize: '1rem',
		fontWeight: '400',
		lineHeight: '150%',
		color: 'var(--navy-dark)',
		cursor: 'not-allowed'
	})
})

export default getSelectStyles
