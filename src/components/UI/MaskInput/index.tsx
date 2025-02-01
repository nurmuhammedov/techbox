import classes from 'components/UI/Input/styles.module.css'
import {useTranslation} from 'react-i18next'
import InputMask from 'react-input-mask'
import {Input} from 'components'
import {ChangeEvent, FocusEvent, forwardRef} from 'react'


interface IProperties {
	id: string
	label?: string
	error?: string
	placeholder: string
	value?: string | number
	mask?: string
	disabled?: boolean
	onChange: (value: ChangeEvent<HTMLInputElement>) => void
	onBlur: (event: FocusEvent<HTMLInputElement>) => void;
}

const Index = forwardRef<HTMLInputElement, IProperties>(({
	                                                         id,
	                                                         label,
	                                                         placeholder = '',
	                                                         mask = '+\\9\\98 99 999 99 99',
	                                                         error,
	                                                         disabled,
	                                                         value,
	                                                         onChange,
	                                                         onBlur
                                                         }, ref) => {
	const {t} = useTranslation()

	return (
		<Input
			id={id}
			type="text"
			label={label}
			error={error}
			disabled={disabled}
		>
			<InputMask
				disabled={disabled}
				data-title="input"
				maskChar=""
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				mask={mask}
				placeholder={t(placeholder)}
				inputRef={ref}
				className={classes.input}
			/>
		</Input>
	)
})

export default Index