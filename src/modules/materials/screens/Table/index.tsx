import {Plus} from 'assets/icons'
import {Button, Tab} from 'components'
import {useSearchParams} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import Materials from 'modules/materials/screens/Materials'
import SellerMaterials from 'modules/materials/screens/SellerMaterials'


const tabOptions: ISelectOption[] = [
	{label: 'Material types', value: 'materialTypes'},
	{label: 'Seller material types', value: 'sellerMaterialTypes'}
]


const Index = () => {
	const {paramsObject: {tab = tabOptions[0]?.value}, addParams} = useSearchParams()

	return (
		<>
			<div className="flex align-center justify-between gap-lg" style={{marginBottom: '.5rem'}}>
				<Tab fallbackValue={tabOptions[0]?.value} tabs={tabOptions}/>
				{
					tab == 'materialTypes' ?
						<Button icon={<Plus/>} onClick={() => addParams({modal: 'materialTypes'})}>
							Add material type
						</Button> :
						tab == 'sellerMaterialTypes' ?
							<Button icon={<Plus/>} onClick={() => addParams({modal: 'sellerMaterialTypes'})}>
								Add seller material type
							</Button> : null
				}
			</div>
			{
				tab === 'materialTypes' ? <Materials/> :
					tab === 'sellerMaterialTypes' ? <SellerMaterials/> :
						null

			}
		</>
	)
}

export default Index