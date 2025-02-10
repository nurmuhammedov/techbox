import ReadyMade from 'modules/warehouse/components/ReadyMade'
import SemiFinished from 'modules/warehouse/components/SemiFinished'
import Materials from 'modules/warehouse/components/Materials'
import {ISelectOption} from 'interfaces/form.interface'
import {Button, Tab} from 'components'
import {useSearchParams} from 'hooks'
import {Plus} from 'assets/icons'


const tabOptions: ISelectOption[] = [
	{label: 'Material warehouse', value: 'materialWarehouse'},
	{label: 'Semi-finished warehouse', value: 'semiFinishedWarehouse'},
	{label: 'Ready-made warehouse', value: 'readyMadeWarehouse'}
]


const Index = () => {
	const {paramsObject: {tab = tabOptions[0]?.value}, addParams} = useSearchParams()

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab fallbackValue={tabOptions[0]?.value} tabs={tabOptions}/>
				{
					tab == 'materialWarehouse' ?
						<Button icon={<Plus/>} onClick={() => addParams({modal: 'materialWarehouse'})}>
							Add material warehouse
						</Button> : tab == 'semiFinishedWarehouse' ?
							<Button icon={<Plus/>} onClick={() => addParams({modal: 'semiFinishedWarehouse'})}>
								Add semi-finished warehouse
							</Button> : tab == 'readyMadeWarehouse' ?
								<Button icon={<Plus/>} onClick={() => addParams({modal: 'readyMadeWarehouse'})}>
									Add ready-made warehouse
								</Button> :
								null
				}
			</div>
			{
				tab === 'materialWarehouse' ? <Materials/> :
					tab === 'semiFinishedWarehouse' ? <SemiFinished/> :
						tab === 'readyMadeWarehouse' ? <ReadyMade/> :
							null

			}
		</>
	)
}

export default Index