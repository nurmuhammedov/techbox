import {Input} from 'components'
import {useSearchParams} from 'hooks'
import React, {useState, useEffect, useRef, ChangeEvent, ChangeEventHandler} from 'react'
import {IField} from 'interfaces/form.interface'


interface FilterInputProps extends Omit<IField, 'onChange'> {
	placeholder?: string
	query: string
	value?: string
}

const FilterInput: React.FC<FilterInputProps> = ({
	                                                 placeholder = 'Search...',
	                                                 query,
	                                                 ...inputProps
                                                 }) => {
	const {addParams, paramsObject, removeParams} = useSearchParams()
	const [inputValue, setInputValue] = useState<string>(String(paramsObject[query] || '') || '')

	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setInputValue(newValue)

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current)
		}

		debounceTimer.current = setTimeout(() => {
			if (!newValue) {
				removeParams(query)
			} else {
				addParams({[query]: newValue})
			}
		}, 500)
	}

	useEffect(() => {
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current)
			}
		}
	}, [])

	return (
		<Input
			{...inputProps}
			id={query}
			value={inputValue}
			placeholder={placeholder}
			onChange={handleInputChange as ChangeEventHandler<HTMLInputElement> & ChangeEventHandler<HTMLTextAreaElement>}
		/>
	)
}

export default FilterInput