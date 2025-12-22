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
	{value: 'human_resources', label: 'Employees'},
	{value: 'role', label: 'Roles'},
	{value: 'material_type', label: 'Material types'},
	{value: 'format', label: 'Formats'},
	{value: 'permissions', label: 'Permissions'},
	{value: 'storekeeper', label: 'Warehouses'},
	{value: 'products', label: 'Products'},
	{value: 'customers', label: 'Clients'},
	{value: 'orders', label: 'Orders'},
	{value: 'materials', label: 'Materials'},
	{value: 'leader', label: 'Director orders'},
	{value: 'operator', label: 'Factory manager orders'},
	{value: 'operator_gofra', label: 'Corrugation orders'},
	{value: 'operator_fleksa', label: 'Flex orders'},
	{value: 'operator_tikish', label: 'Sewing orders'},
	{value: 'company_operations', label: 'Company operations'},
	{value: 'operator_yelimlash', label: 'Gluing orders'},
	{value: 'chemical_types', label: 'Chemical types'},
	{value: 'chemicals', label: 'Chemicals'},
	{value: 'glue', label: 'Glue'}
]


const statusOptions: ISelectOption[] = [
	{value: 'new', label: 'New orders'},
	// {value: 'in_line', label: 'Queued orders'},
	{value: 'in_proces', label: 'In progress orders'},
	{value: 'finished', label: 'Finished orders'},
	{value: 'sold', label: 'Sold orders'},
	{value: 'defective', label: 'Defective products'},
	{value: 'sold-defective', label: 'Sold defective products'}
]

const companyOperationsOptions: ISelectOption[] = [
	{value: 'new', label: 'New orders'},
	// {value: 'in_line', label: 'Queued orders'},
	{value: 'in_proces', label: 'In progress orders'},
	{value: 'finished', label: 'Finished orders'}
]

const operatorsStatusOptions: ISelectOption[] = [
	{value: 1, label: 'New orders'},
	{value: 2, label: 'History'}
]

export const bossStatusOptions: ISelectOption[] = [
	{value: 1, label: 'New orders'},
	{value: 3, label: 'Flex'},
	{value: 4, label: 'YMO'},
	{value: 2, label: 'History'}
]

const flexOperatorsStatusOptions: ISelectOption[] = [
	{value: 'new', label: 'New orders'},
	{value: 'procces', label: 'In progress orders'},
	{value: 'history', label: 'History'}
]

const booleanOptions: ISearchParams[] = [
	{value: true, label: 'Has'},
	{value: false, label: 'No'}
]

const yesNoOptions: ISearchParams[] = [
	{value: true, label: 'Yes'},
	{value: false, label: 'No'}
]

const activityOptions: ISelectOption[] = [
	{value: 'gofra', label: 'Corrugation'},
	{value: 'ymo1', label: 'YMO'},
	{value: 'fleksa', label: 'Flex'},
	{value: 'ymo2', label: 'YMO2'},
	{value: 'tikish', label: 'Sewing'},
	{value: 'yelimlash', label: 'Gluing'},
	{value: 'is_last', label: 'Warehouse'}
]

const cutOptions: ISelectOption[] = [
	{value: 'total', label: '1', material: 1},
	{value: 'half', label: '1/2', material: 2},
	{value: 'one_third', label: '1/3', material: 3},
	{value: 'one_fourth', label: '1/4', material: 4}
]

export {
	flexOperatorsStatusOptions,
	companyOperationsOptions,
	operatorsStatusOptions,
	paginationOptions,
	activityOptions,
	booleanOptions,
	yesNoOptions,
	statusOptions,
	cutOptions,
	roleOptions
}