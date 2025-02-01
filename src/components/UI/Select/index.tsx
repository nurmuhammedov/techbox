import {ISelect, ISelectOption} from 'interfaces/form.interface'
import {forwardRef, LegacyRef, useMemo} from 'react'
import getSelectStyles from 'helpers/select'
import {useTranslation} from 'react-i18next'
import {SelectIcon} from 'assets/icons'
import {Input} from 'components'
import Select, {
	components,
	DropdownIndicatorProps,
	PlaceholderProps,
	SingleValueProps,
	MultiValueProps,
	SelectInstance,
	StylesConfig,
	NoticeProps,
	OptionProps,
	GroupBase
} from 'react-select'


const SingleValue = (props: SingleValueProps<ISelectOption>) => {
	const {t} = useTranslation()
	return (
		<components.SingleValue {...props}>
			{props.data.icon ? props.data.icon : null}
			{props.data.label ? t(props.data.label.toString()) : ''}
		</components.SingleValue>
	)
}

const Option = (props: OptionProps<ISelectOption>) => {
	const {t} = useTranslation()
	return (
		<components.Option {...props}>
			{props.data.icon ? props.data.icon : null}
			<span>{props.data.label ? t(props.data.label.toString()) : ''}</span>
		</components.Option>
	)
}

const DropdownIndicator = (props: DropdownIndicatorProps<ISelectOption>) => (
	<components.DropdownIndicator {...props}>
		<SelectIcon/>
	</components.DropdownIndicator>
)

const NoMessage = (props: NoticeProps<ISelectOption>) => {
	return (
		<components.NoOptionsMessage {...props}>
			📂
		</components.NoOptionsMessage>
	)
}

const MultiValue = (props: MultiValueProps<ISelectOption>) => {
	const {t} = useTranslation()

	return (
		<components.MultiValue {...props}>
			{props.data.label ? t(props.data.label.toString()) : ''}
		</components.MultiValue>
	)
}

const IndicatorSeparator = () => null

const Index = forwardRef<SelectInstance<ISelectOption>, ISelect>((props, ref) => {
	const {t} = useTranslation()

	const Placeholder = useMemo(() => {
		return (properties: PlaceholderProps<ISelectOption>) => {
			return (
				<components.Placeholder {...properties}>
					{props.icon ? props?.icon : null}
					{properties.children}
				</components.Placeholder>
			)
		}
	}, [props.icon])

	return (
		<Input id={props.id} label={props.label} error={props.error} disabled={props.disabled}>
			<Select
				styles={getSelectStyles(!!props.error, props.top) as StylesConfig<ISelectOption, boolean, GroupBase<ISelectOption>>}
				menuPlacement={props.top ? 'top' : 'bottom'}
				hideSelectedOptions
				isDisabled={props.disabled}
				isSearchable={true}
				isClearable={false}
				{...props}
				placeholder={props.placeholder ? t(props.placeholder) : t('Choose')}
				ref={ref as LegacyRef<SelectInstance<ISelectOption, boolean, GroupBase<ISelectOption>>>}
				onChange={(value) => {
					if (Array.isArray(value)) {
						props.handleOnChange?.(value.map((v) => v?.value))
					} else {
						const option = value as ISelectOption
						props.handleOnChange?.(option?.value ?? null)
					}
				}}
				components={{
					NoOptionsMessage: NoMessage,
					IndicatorSeparator,
					DropdownIndicator,
					SingleValue,
					Placeholder,
					MultiValue,
					Option
				}}
			/>
		</Input>
	)
})

export default Index
