import {BUTTON_THEME} from 'constants/fields'
import {IButton} from 'interfaces/form.interface'
import React from 'react'
import classNames from 'classnames'
import styles from './styles.module.scss'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'


const Index: React.FC<IButton> = ({
	                                  children,
	                                  theme = BUTTON_THEME.PRIMARY,
	                                  disabled,
	                                  type = 'button',
	                                  icon,
	                                  mini = false,
	                                  iconPosition = 'left',
	                                  navigate: redirect = '',
	                                  ...props
                                  }) => {
	const {t} = useTranslation()
	const navigate = useNavigate()
	return (
		<button
			className={classNames(
				styles.button,
				{[styles[`mini`]]: mini},
				{[styles[`button--primary`]]: theme === BUTTON_THEME.PRIMARY},
				{[styles[`button--primary-outline`]]: theme === BUTTON_THEME.PRIMARY_OUTLINE},
				{[styles[`button--danger`]]: theme === BUTTON_THEME.DANGER},
				{[styles[`button--danger-outline`]]: theme === BUTTON_THEME.DANGER_OUTLINE},
				{[styles[`button--outline`]]: theme === BUTTON_THEME.OUTLINE},
				{[styles[`button--disabled`]]: disabled}
			)}
			disabled={disabled}
			type={type}
			onClick={() => !!redirect && navigate(redirect)}
			{...props}
		>
			{
				icon && (
					<span
						className={classNames(
							styles[`button__icon`],
							styles[`button__icon--${iconPosition}`]
						)}
					>
                    {icon}
                </span>
				)
			}
			{
				t(children as string)
			}
		</button>
	)
}

export default Index
