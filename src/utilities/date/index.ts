import {ISelectOption} from 'interfaces/form.interface'


function formatDate(isoDateString: string | null | undefined): string {
	if (!isoDateString) return ''
	const date = new Date(isoDateString)
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')

	return `${day}.${month}.${year} - ${hours}:${minutes}`
}

const getDate = (dateStr?: string | null): string => {
	let date: Date
	if (dateStr === undefined) {
		date = new Date()
	}
	if (!dateStr && dateStr !== undefined) {
		return ''
	}

	if (dateStr) {
		date = new Date(dateStr)
		if (isNaN(date.getTime())) return ''
	} else {
		date = new Date()
	}

	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()

	return `${day}.${month}.${year}`
}

function generateYearList(startYear: number = 1900): ISelectOption[] {
	const currentYear = new Date().getFullYear()
	const years: ISelectOption[] = []

	for (let year = startYear; year <= currentYear; year++) {
		years.push({value: year.toString(), label: year.toString()})
	}

	return years.reverse()
}


const formatDateToISO = (dateStr?: string): string | null => {
	console.log(dateStr, '2')
	if (!dateStr || dateStr.length < 10) {
		return null
	}
	const [day, month, year] = dateStr.split('.')
	if (!day || !month || !year) {
		const [y, m, d] = dateStr.split('-')
		if (!y || !m || !d) {
			return null
		}
		return `${y}-${m}-${d}`
	}
	return `${year}-${month}-${day}`
}


export {
	generateYearList,
	formatDate,
	getDate,
	formatDateToISO
}