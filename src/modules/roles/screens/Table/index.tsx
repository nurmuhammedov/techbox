import {Plus} from 'assets/icons'
import {Button, Tab} from 'components'
import {useSearchParams} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import Positions from 'modules/roles/components/Positions'
import Roles from 'modules/roles/components/Roles'


const tabOptions: ISelectOption[] = [
	{label: 'Roles', value: 'roles'},
	{label: 'Positions', value: 'positions'}
]


const Index = () => {
	const {paramsObject: {tab = tabOptions[0]?.value}, addParams} = useSearchParams()

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab fallbackValue={tabOptions[0]?.value} tabs={tabOptions}/>
				{
					tab == 'roles' ?
						<Button icon={<Plus/>} onClick={() => addParams({modal: 'role'})}>
							Add role
						</Button> :
						tab == 'positions' ?
							<Button icon={<Plus/>} onClick={() => addParams({modal: 'position'})}>
								Add position
							</Button> : null
				}
			</div>
			{
				tab === 'roles' ? <Roles/> :
					tab === 'positions' ? <Positions/> :
						null

			}
		</>
	)
}

export default Index