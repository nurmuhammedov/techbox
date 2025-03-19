import {Corrugation, Flex, RightArrow, YMO} from 'assets/icons'
import {Button, Input, Card, Loader} from 'components'
import {BUTTON_THEME} from 'constants/fields'
import {useDetail} from 'hooks/index'
import {IOrderDetail} from 'interfaces/orders.interface'
import {useTranslation} from 'react-i18next'
import {useNavigate, useParams} from 'react-router-dom'
import styles from './styles.module.scss'


const Index = () => {
	const {id = undefined} = useParams()
	const {t} = useTranslation()
	const navigate = useNavigate()


	const {
		data: detail,
		isPending: isDetailLoading
	} = useDetail<IOrderDetail>('services/orders/', id, !!id)


	if (isDetailLoading) return (<Loader/>)


	return (
		<>
			<div style={{display: 'flex', justifyContent: 'flex-end'}}>
				<Button onClick={() => navigate(-1)} theme={BUTTON_THEME.OUTLINE}>
					Back
				</Button>
			</div>

			<Card screen={true}
			      style={{marginTop: '1.5rem', padding: '1.5rem', width: 'calc(100vw - 19.5rem)', overflowX: 'scroll'}}>
				<div className={styles.titles}>
					<h1>{t('Recycling')}</h1>
					<h1>{t('Warehouse')} №1</h1>
					<h1 style={{top: '-100%'}}>{t('Flex')}</h1>
					<h1>{t('Warehouse')} №2</h1>
					<h1>{t('Sewing/Gluing')}</h1>
				</div>
				<div className={styles.icons}>
					<div className={styles.item}>
						<Corrugation/>
					</div>
					<RightArrow/>
					<div className={styles.item}>
						<YMO/>
					</div>
					<RightArrow/>
					<div className={styles.item}>
						<Flex/>
					</div>
					<RightArrow/>
					<div className={styles.item}>
						<YMO/>
					</div>
					<RightArrow/>
					<div className={styles.item}>
						<Corrugation/>
					</div>
				</div>
				<div className={styles.inputs}>
					<div className={styles.item}>
						<Input
							id="count"
							label="Count"
							placeholder=" "
							value={detail?.count_after_processing || ''}
							disabled={true}
						/>
					</div>
					<div className={styles.item}>
						<Input
							id="count"
							label="Warehouse"
							placeholder=" "
							value={detail?.warehouse_same_finished?.name || ''}
							disabled={true}
						/>
					</div>
					<div className={styles.item}>
						<Input
							id="count"
							label="Count"
							placeholder=" "
							value={detail?.count_after_flex || ''}
							disabled={true}
						/>
					</div>
					<div className={styles.item}>
						<Input
							id="count"
							label="Warehouse"
							placeholder=" "
							value={['ymo2', 'tikish', 'yelimlash'].includes(detail?.activity || '') ? detail?.warehouse_same_finished?.name : ''}
							disabled={true}
						/>
					</div>
					<div className={styles.item}>
						<Input
							placeholder=" "
							id="count"
							label="Count"
							value={detail?.count_after_bet || detail?.count_after_gluing || ''}
							disabled={true}
						/>
					</div>
				</div>
			</Card>
		</>
	)
}

export default Index