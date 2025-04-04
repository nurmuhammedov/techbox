import {Plus} from 'assets/icons'
import {Button, Tab} from 'components'
import {useSearchParams} from 'hooks'
import {ISelectOption} from 'interfaces/form.interface'
import Countries from 'modules/materials/screens/Countries'
import Materials from 'modules/materials/screens/Materials'
import SellerMaterials from 'modules/materials/screens/SellerMaterials'
import Suppliers from 'modules/materials/screens/Suppliers'


const tabOptions: ISelectOption[] = [
	{label: 'Material types', value: 'materialTypes'},
	{label: 'Seller material types', value: 'sellerMaterialTypes'},
	{label: 'Suppliers', value: 'suppliers'},
	{label: 'Countries', value: 'countries'}
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
						</Button> : tab == 'sellerMaterialTypes' ?
							<Button icon={<Plus/>} onClick={() => addParams({modal: 'sellerMaterialTypes'})}>
								Add seller material type
							</Button> : tab == 'countries' ?
								<Button icon={<Plus/>} onClick={() => addParams({modal: 'countries'})}>
									Add country
								</Button> : tab == 'suppliers' ?
									<Button icon={<Plus/>} onClick={() => addParams({modal: 'suppliers'})}>
										Add supplier
									</Button> : null
				}
			</div>
			{
				tab === 'materialTypes' ? <Materials/> :
					tab === 'sellerMaterialTypes' ? <SellerMaterials/> :
						tab === 'countries' ? <Countries/> :
							tab === 'suppliers' ? <Suppliers/> :
								null

			}
		</>
	)
}

export default Index