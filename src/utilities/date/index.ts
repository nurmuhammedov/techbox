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

const getDate = (dateStr?: string): string => {
	let date: Date

	if (!dateStr) {
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


export {
	generateYearList,
	formatDate,
	getDate
}