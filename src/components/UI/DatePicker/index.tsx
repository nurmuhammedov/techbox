import { forwardRef } from 'react'
import ReactDatePicker from 'react-datepicker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-datepicker/dist/react-datepicker.css'
import { useTranslation } from 'react-i18next'
import { Input } from 'components'
import classes from './styles.module.scss'
import inputClasses from 'components/UI/Input/styles.module.scss'
import classNames from 'classnames'

interface IDatePickerProps {
	id: string
	label?: string
	error?: string
	placeholder?: string
	value?: string | null
	disabled?: boolean
	onChange: (value: string | null) => void
	onBlur?: () => void
	showTimeSelect?: boolean
}

const OY_NOMLARI = [
	'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
	'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
]

const HAFTA_KUNLARI: Record<string, string> = {
	Sunday: 'Yak',
	Monday: 'Du',
	Tuesday: 'Se',
	Wednesday: 'Cho',
	Thursday: 'Pay',
	Friday: 'Ju',
	Saturday: 'Sha'
}

const DatePicker = forwardRef<any, IDatePickerProps>(
	({ id, label, error, placeholder, value, disabled, onChange, onBlur, showTimeSelect = false }, ref) => {
		const { t } = useTranslation()

		// Convert string to Date object (supports YYYY-MM-DD and YYYY-MM-DDTHH:mm)
		const getSelectedDate = (dateStr?: string | null) => {
			if (!dateStr) return null
			const date = new Date(dateStr)
			if (!isNaN(date.getTime())) {
				return date
			}
			return null
		}

		// Convert Date object to YYYY-MM-DD or YYYY-MM-DDTHH:mm string
		const formatDateToString = (date: Date | null) => {
			if (!date) return null
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			if (showTimeSelect) {
				const hours = String(date.getHours()).padStart(2, '0')
				const minutes = String(date.getMinutes()).padStart(2, '0')
				return `${year}-${month}-${day}T${hours}:${minutes}`
			}
			return `${year}-${month}-${day}`
		}

		const selectedDate = getSelectedDate(value)
		const defaultPlaceholder = showTimeSelect ? 'kk.oo.yyyy, 09:00' : 'kk.oo.yyyy'
		
		const currentYear = new Date().getFullYear()
		const yillar = Array.from({ length: 60 }, (_, i) => currentYear - 40 + i)

		return (
			<Input id={id} label={label} error={error} disabled={disabled}>
				<div className={classes.wrapper}>
					<ReactDatePicker
						ref={ref}
						selected={selectedDate}
						onChange={(date: Date | null) => {
							const formatted = formatDateToString(date)
							onChange(formatted)
						}}
						onBlur={onBlur}
						showTimeSelect={showTimeSelect}
						timeFormat="HH:mm"
						timeIntervals={15}
						timeCaption={t('Time')}
						dateFormat={showTimeSelect ? 'dd.MM.yyyy HH:mm' : 'dd.MM.yyyy'}
						placeholderText={placeholder ? t(placeholder) : defaultPlaceholder}
						disabled={disabled}
						id={id}
						className={classNames(inputClasses.input, classes.dateInput)}
						wrapperClassName={classes.dateWrapper}
						autoComplete="off"
						isClearable={!disabled && !!value}
						onKeyDown={(e) => e.preventDefault()} // Yozishni cheklash
						showPopperArrow={false} // Uchburchak strelkani olib tashlash
						popperPlacement="bottom-start" // Chap tomonga tekislash
						calendarStartDay={1} // Dushanbadan boshlash
						formatWeekDay={(day) => HAFTA_KUNLARI[day] || day} // Hafta kunlari tarjimasi
						renderCustomHeader={({
							date,
							changeYear,
							changeMonth,
							decreaseMonth,
							increaseMonth,
							prevMonthButtonDisabled,
							nextMonthButtonDisabled
						}) => (
							<div className={classes.customHeader}>
								<button 
									onClick={decreaseMonth} 
									disabled={prevMonthButtonDisabled} 
									type="button"
									className={classes.headerBtn}
								>
									<ChevronLeft size={20} strokeWidth={2} />
								</button>
								
								<select
									className={classes.headerSelect}
									value={OY_NOMLARI[date.getMonth()]}
									onChange={({ target: { value } }) => changeMonth(OY_NOMLARI.indexOf(value))}
								>
									{OY_NOMLARI.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>

								<select
									className={classes.headerSelect}
									value={date.getFullYear()}
									onChange={({ target: { value } }) => changeYear(Number(value))}
								>
									{yillar.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>

								<button 
									onClick={increaseMonth} 
									disabled={nextMonthButtonDisabled} 
									type="button"
									className={classes.headerBtn}
								>
									<ChevronRight size={20} strokeWidth={2} />
								</button>
							</div>
						)}
					/>
				</div>
			</Input>
		)
	}
)

DatePicker.displayName = 'DatePicker'

export default DatePicker
