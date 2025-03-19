import {Plus} from 'assets/icons'
import {Button, Tab} from 'components'
import {ROLE_LIST} from 'constants/roles'
import {useAppContext, useSearchParams} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import Materials from 'modules/warehouse/components/Materials'
import ReadyMade from 'modules/warehouse/components/ReadyMade'
import SemiFinished from 'modules/warehouse/components/SemiFinished'


const tabOptions: ISelectOption[] = [
	{label: 'Material warehouse', value: 'materialWarehouse'},
	{label: 'Semi-finished warehouse', value: 'semiFinishedWarehouse'},
	{label: 'Ready-made warehouse', value: 'readyMadeWarehouse'}
]


const Index = () => {
	const {paramsObject: {tab = tabOptions[0]?.value}, addParams} = useSearchParams()
	const {user} = useAppContext()

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab fallbackValue={tabOptions[0]?.value} tabs={tabOptions}/>
				{
					user?.role === ROLE_LIST.ADMIN && (
						<>
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
						</>
					)
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