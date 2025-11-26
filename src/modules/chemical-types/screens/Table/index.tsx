import {Plus} from 'assets/icons'
import {Button, Tab} from 'components'
import {useSearchParams} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import ChemicalType from 'modules/chemical-types/components/ChemicalType'
import GlueType from 'modules/chemical-types/components/GlueType'


const tabOptions: ISelectOption[] = [
	{label: 'Chemical types', value: 'chemical-types'},
	{label: 'Glue types', value: 'glue-types'}
]

const ChemicalsIndex = () => {
	const {paramsObject: {tab = tabOptions[0]?.value}, addParams} = useSearchParams()

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab fallbackValue={tabOptions[0]?.value} tabs={tabOptions}/>
				{
					tab === 'chemical-types' ? (
						<Button icon={<Plus/>} onClick={() => addParams({modal: 'chemical-type'})}>
							Add chemical type
						</Button>
					) : tab === 'glue-types' ? (
						<Button icon={<Plus/>} onClick={() => addParams({modal: 'glue-type'})}>
							Add glue type
						</Button>
					) : null
				}
			</div>
			{
				tab === 'chemical-types' ? <ChemicalType/> :
					tab === 'glue-types' ? <GlueType/> :
						null
			}
		</>
	)
}

export default ChemicalsIndex
