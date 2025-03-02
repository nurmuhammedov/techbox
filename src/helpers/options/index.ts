import {ISelectOption} from 'interfaces/form.interface'
import {ISearchParams} from 'interfaces/params.interface'


const paginationOptions: ISelectOption[] = [
	{value: 5, label: '5'},
	{value: 10, label: '10'},
	{value: 20, label: '20'},
	{value: 50, label: '50'},
	{value: 100, label: '100'}
]

const roleOptions: ISelectOption[] = [
	{value: 'human_resources', label: 'Human resources department'},
	{value: 'role', label: 'Roles'}
]

const statusOptions: ISelectOption[] = [
	{value: 'new', label: 'New orders'},
	{value: 'in_line', label: 'Queued orders'},
	{value: 'in_proces', label: 'In progress orders'},
	{value: 'finished', label: 'Finished orders'}
]
const operatorsStatusOptions: ISelectOption[] = [
	{value: 'False', label: 'New orders'},
	{value: 'True', label: 'Orders sent'}
]

const booleanOptions: ISearchParams[] = [
	{value: true, label: 'Has'},
	{value: false, label: 'No'}
]

const activityOptions: ISelectOption[] = [
	{value: 'gofra', label: 'Corrugation'},
	{value: 'ymo1', label: 'YMO'},
	{value: 'fleksa', label: 'Flex'},
	{value: 'ymo2', label: 'YMO'},
	{value: 'tikish', label: 'Sewing'},
	{value: 'yelimlash', label: 'Gluing'}
]

export {
	operatorsStatusOptions,
	paginationOptions,
	activityOptions,
	booleanOptions,
	statusOptions,
	roleOptions
}