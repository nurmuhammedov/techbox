import {FIELD} from 'constants/fields'
import {IField} from 'interfaces/form.interface'
import React, {forwardRef} from 'react'
import classNames from 'classnames'
import styles from './styles.module.scss'
import {useTranslation} from 'react-i18next'


const Index = forwardRef<HTMLInputElement | HTMLTextAreaElement, IField>(
	(
		{
			iconPosition = 'left',
			autocomplete = false,
			type = FIELD.TEXT,
			textarea = false,
			radius = false,
			handleIcon,
			children,
			label,
			error,
			icon,
			id,
			...props
		},
		ref
	) => {
		const {t} = useTranslation()

		return (
			<div className={classNames(styles.root, {
				[styles.error]: error,
				[styles.icon]: icon,
				[styles.radius]: radius
			})}>
				{
					label && (
						<div className={styles.wrapper}>
							<label htmlFor={id}>{t(label)}</label>
						</div>
					)
				}
				{
					children ? children :
						textarea ? (
							<textarea
								rows={5}
								{...props}
								data-title="input"
								ref={ref as React.Ref<HTMLTextAreaElement>}
								id={id.toString()}
								className={styles.input}
								placeholder={props.placeholder ? t(props.placeholder as string) : t('Enter value')}
								autoComplete={autocomplete ? 'on' : 'off'}
							/>
						) : (
							<div
								className={classNames(styles['input-wrapper'], {[styles.right]: iconPosition === 'right'})}
							>
								{
									icon &&
									<div className={styles['icon-wrapper']} onClick={() => handleIcon?.()}>
										{icon}
									</div>
								}
								<input
									{...props}
									ref={ref as React.Ref<HTMLInputElement>}
									id={id.toString()}
									type={type}
									data-title="input"
									className={styles.input}
									placeholder={props.placeholder ? t(props.placeholder as string) : t('Enter value')}
									autoComplete={autocomplete ? 'on' : 'off'}
								/>
							</div>
						)}
				{error && <span className={styles['error__message']}>{t(error as string)}</span>}
			</div>
		)
	}
)

export default Index
