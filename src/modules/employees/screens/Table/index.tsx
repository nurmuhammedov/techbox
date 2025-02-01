import {Plus} from 'assets/icons'
import {Button, PageTitle} from 'components'
import {BUTTON_THEME} from 'constants/fields'


const Index = () => {
	return (
		<>
			<PageTitle title="Home">
				<div className="flex align-center gap-lg">
					<Button
						theme={BUTTON_THEME.PRIMARY}
						icon={<Plus/>}
					>
						Making trade
					</Button>
					<Button
						theme={BUTTON_THEME.PRIMARY}
					>
						Making income
					</Button>
				</div>
			</PageTitle>
		</>
	)
}

export default Index