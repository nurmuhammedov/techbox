import {Corrugation, Flex, RightArrow, YMO} from 'assets/icons'
import Card from 'components/Card'
import {Button} from 'components/UI'
import {BUTTON_THEME} from 'constants/fields'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import styles from './styles.module.scss'


const Index = () => {
	const {t} = useTranslation()
	const navigate = useNavigate()
	return (
		<div className={styles.root}>
			<div className={styles.titles}>
				<h1>{t('Recycling')}</h1>
				<h1>{t('Warehouse')} №1</h1>
				<h1>{t('Flex')}</h1>
				<h1>{t('Warehouse')} №2</h1>
				<h1>{t('Sewing/Gluing')}</h1>
			</div>
			<Card style={{marginTop: '1.5rem', padding: '1.5rem', width: 'calc(100%)'}}>
				<div className={styles.icons}>
					<div>
						<Corrugation/>
					</div>
					<RightArrow/>
					<div>
						<YMO/>
					</div>
					<RightArrow/>
					<div>
						<Flex/>
					</div>
					<RightArrow/>
					<div>
						<YMO/>
					</div>
					<RightArrow/>
					<div>
						<Corrugation/>
					</div>
				</div>
				<div style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-start'}}>
					<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
						Back
					</Button>
				</div>
			</Card>

		</div>
	)
}

export default Index