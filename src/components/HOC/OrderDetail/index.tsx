import {
	useData,
	useDetail
} from 'hooks'
import {
	Card,
	Diagram, FileUpLoader,
	Input,
	Loader,
	Select
} from 'components'
import {IOrderDetail} from 'interfaces/orders.interface'
import {decimalToInteger, getSelectValue} from 'utilities/common'
import {IFIle, ISelectOption} from 'interfaces/form.interface'
import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'
import classNames from 'classnames'
import {getDate} from 'utilities/date'
import {ComponentType} from 'react'
import {activityOptions} from 'helpers/options'
import {useParams} from 'react-router-dom'


const Index = <P extends object>(WrappedComponent: ComponentType<P>) => {
	return (props: P) => {
		const {t} = useTranslation()
		const {id} = useParams()
		const {data: materials = []} = useData<ISelectOption[]>('products/materials/select')

		const {
			data: order,
			isPending: isDetailLoading
		} = useDetail<IOrderDetail>('services/orders/', id, !!id)


		if (isDetailLoading || !order) {
			return <Loader/>
		}


		return (
			<>
				<WrappedComponent {...(props as P)} detail={order}/>
				<div className={classNames(styles.root, 'grid gap-lg')} style={{marginTop: '1rem'}}>
					<div className="grid gap-lg span-6">
						<Card
							screen={false}
							style={{padding: '1.5rem'}}
							className="span-12"
						>
							<div className="grid gap-md">
								<div
									style={{marginBottom: '1.5rem'}}
									className="flex span-12 justify-between gap-lg align-center"
								>
									<div className={styles.title}>
										{order.company_name}
									</div>
									<div className="flex gap-xs align-center">
										<div className={styles.order}>
											{t('Order number')}
										</div>
										<div className={styles.number}>
											#{order.id}
										</div>
									</div>
								</div>
								<div className="span-4">
									<Input
										id="sizes"
										disabled={true}
										label={`${t('Sizes')} (${t('mm')})`}
										value={`${order.length}*${order.width}*${order.height}`}
									/>
								</div>
								<div className="span-4">
									<Input
										id="L"
										disabled={true}
										label="L"
										value={`${2 * Number(order.width || 0) + 70 + 2 * Number(order.length || 0)}`}
									/>
								</div>
								<div className="span-4">
									<Input
										id="format"
										disabled={true}
										label="Format"
										value={order?.format?.format}
									/>
								</div>
								<div className="span-4">
									<Input
										id="layer"
										disabled={true}
										label="Layer"
										value={order?.layer?.length || order?.layer_seller?.length || 0}
									/>
								</div>

								{
									order?.layer?.map((layer, index) => (
										<div className="span-4" key={index}>
											<Select
												id={`layer-${index + 1}`}
												label={`${index + 1}-${t('layer')}`}
												options={materials}
												disabled={true}
												value={getSelectValue(materials, layer)}
												defaultValue={getSelectValue(materials, layer)}
											/>
										</div>
									))
								}

								<div className="span-4">
									<Input
										id="count"
										disabled={true}
										label="Count"
										value={decimalToInteger(order?.count_last || 0)}
									/>
								</div>

								<div className="span-4">
									<Input
										id="count"
										disabled={true}
										label="Deadline"
										value={getDate(order?.deadline || '')}
									/>
								</div>

								<div className="grid span-12" style={{marginTop: '.7rem'}}>
									<Diagram
										l0={
											<Input
												id="l0"
												mini={true}
												disabled={true}
												value={order?.l0 || ''}
												placeholder="mm"
											/>
										}
										l1={
											<Input
												id="l1"
												mini={true}
												disabled={true}
												value={order?.l1 || ''}
												placeholder="mm"
											/>
										}
										l2={
											<Input
												id="l2"
												mini={true}
												disabled={true}
												value={order?.l2 || ''}
												placeholder="mm"
											/>
										}
										l3={
											<Input
												id="l3"
												mini={true}
												disabled={true}
												value={order?.l3 || ''}
												placeholder="mm"
											/>
										}
										l4={
											<Input
												id="l4"
												mini={true}
												disabled={true}
												value={order?.l4 || ''}
												placeholder="mm"
											/>
										}
										l5={
											<Input
												id="l5"
												mini={true}
												disabled={true}
												value={order?.l5 || ''}
												placeholder="mm"
											/>
										}
										className="span-12"
									/>
								</div>

								{
									order?.logo &&
									<FileUpLoader
										id="logo"
										type="image"
										value={order?.logo as IFIle}
										onChange={undefined}
										label="Logo"
									/>
								}

								<div className="span-12">
									<Input
										id="comment"
										disabled={true}
										label="Comment"
										value={order?.comment || ' '}
									/>
								</div>

								<div
									className="span-12 flex gap-md"
									style={{marginTop: '.7rem', marginBottom: '1.5rem'}}
								>
									<div className="span-4 flex gap-md align-end justify-start">
										<input
											id={activityOptions[0].value as string}
											type="checkbox"
											className="checkbox"
											checked={order?.stages_to_passed?.includes(activityOptions[0].value as string) || false}
										/>
										<p className="checkbox-label">
											{t(activityOptions[0].label as string)}
										</p>
									</div>
									<div className="span-4 flex gap-md align-end justify-start">
										<input
											id={activityOptions[1].value as string}
											type="checkbox"
											className="checkbox"
											checked={order?.stages_to_passed?.includes(activityOptions[1].value as string) || false}
										/>
										<p className="checkbox-label">
											{t(activityOptions[1].label as string)}
										</p>
									</div>
									<div className="span-4 flex gap-md align-end justify-start">
										<input
											id={activityOptions[2].value as string}
											type="checkbox"
											className="checkbox"
											checked={order?.stages_to_passed?.includes(activityOptions[2].value as string) || false}
										/>
										<p className="checkbox-label">
											{t(activityOptions[2].label as string)}
										</p>
									</div>
									<div className="span-4 flex gap-md align-end justify-start">
										<input
											id={activityOptions[3].value as string}
											type="checkbox"
											className="checkbox"
											checked={order?.stages_to_passed?.includes(activityOptions[3].value as string) || false}
										/>
										<p className="checkbox-label">
											{t(activityOptions[3].label as string)}
										</p>
									</div>
									<div className="span-4 flex gap-md align-end justify-start">
										<input
											id={activityOptions[4].value as string}
											type="checkbox"
											className="checkbox"
											checked={order?.stages_to_passed?.includes(activityOptions[4].value as string) || false}
										/>
										<p className="checkbox-label">
											{t(activityOptions[4].label as string)}
										</p>
									</div>
									<div className="span-4 flex gap-md align-end justify-start">
										<input
											id={activityOptions[5].value as string}
											type="checkbox"
											className="checkbox"
											checked={order?.stages_to_passed?.includes(activityOptions[5].value as string) || false}
										/>
										<p className="checkbox-label">
											{t(activityOptions[5].label as string)}
										</p>
									</div>
									<div className="span-4 flex gap-md align-end justify-start">
										<input
											id={activityOptions[6].value as string}
											type="checkbox"
											className="checkbox"
											checked={order?.stages_to_passed?.includes(activityOptions[6].value as string) || false}
										/>
										<p className="checkbox-label">
											{t(activityOptions[6].label as string)}
										</p>
									</div>
								</div>

							</div>
						</Card>
					</div>
				</div>
			</>
		)
	}
}

export default Index