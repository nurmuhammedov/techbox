import styles from 'components/UI/Input/styles.module.css'
import {Input} from 'components'
import {FIELD} from 'constants/fields'
import CurrencyInput from 'react-currency-input-field'
import {useTranslation} from 'react-i18next'
import {FocusEvent, forwardRef} from 'react'


interface IProps {
	id: string
	label?: string
	error?: string
	placeholder?: string
	maxLength?: number
	disableGroupSeparators?: boolean
	allowDecimals?: boolean
	groupSeparator?: string
	value?: string | number
	disabled?: boolean
	onChange?: (event: string) => void;
	onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

const Index = forwardRef<HTMLInputElement, IProps>(({
	                                                    disableGroupSeparators = false,
	                                                    allowDecimals = true,
	                                                    onBlur,
	                                                    id,
	                                                    label,
	                                                    placeholder = '',
	                                                    error,
	                                                    maxLength = 20,
	                                                    groupSeparator = ' ',
	                                                    value,
	                                                    disabled,
	                                                    onChange,
	                                                    ...props
                                                    }, ref) => {
	const {t} = useTranslation()
	return (
		<Input
			id={id}
			type={FIELD.TEXT}
			label={label}
			error={error}
			value={value}
			disabled={disabled}
			{...props}
		>
			<CurrencyInput
				id={id}
				name={id}
				className={styles.input}
				disabled={disabled}
				data-title="input"
				placeholder={placeholder ? t(placeholder) : t('Enter value')}
				disableAbbreviations={true}
				allowDecimals={allowDecimals}
				allowNegativeValue={false}
				maxLength={maxLength}
				groupSeparator={groupSeparator}
				disableGroupSeparators={disableGroupSeparators}
				decimalSeparator="."
				ref={ref}
				defaultValue={value}
				value={value}
				autoComplete="off"
				onValueChange={value => !value ? onChange?.('') : onChange?.(value)}
				onBlur={onBlur}
				{...props}
			/>
		</Input>
	)
})

export default Index