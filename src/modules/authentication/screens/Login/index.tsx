import {LoginLogo} from 'assets/icons'
import {FIELD} from 'constants/fields'
import {loginSchema} from 'helpers/yup'
import {ILoginForm} from 'interfaces/yup.interface'
import {useLogin} from 'modules/authentication/hooks'
import {routeByRole} from 'utilities/authentication'
import styles from './styles.module.scss'
import {useTranslation} from 'react-i18next'
import {useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {useUser} from 'hooks'
import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Loader, Button, Input} from 'components'


const Index = () => {
	const {t} = useTranslation()
	const navigate = useNavigate()
	const {user, isPending: isUserPending} = useUser()
	const [isLoading, setIsLoading] = useState(true)
	const {isPending, login} = useLogin()


	const {
		register,
		handleSubmit,
		formState: {errors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {
			username: 'muhammad',
			password: 'muhammad'
		},
		resolver: yupResolver(loginSchema)
	})

	useEffect(() => {
		if (!isUserPending) {
			if (user) {
				navigate(routeByRole(user.role))
			} else {
				const timer = setTimeout(() => setIsLoading(false), 1250)
				return () => clearTimeout(timer)
			}
		}
	}, [isUserPending])


	if (isUserPending || isLoading) {
		return <Loader screen background/>
	}

	return (
		<div className={styles.root}>
			<div className={styles.left}>
				<LoginLogo/>
				<div className={styles.slogan}>
					{t('TechBox')}
				</div>
			</div>

			<div className={styles.wrapper}>
				<h1>{t('Login to the system')}</h1>
				<form onSubmit={handleSubmit((data: ILoginForm) => login(data))}>
					<Input
						id="login"
						type={FIELD.TEXT}
						label="Login"
						required={true}
						error={errors?.username?.message}
						placeholder={'Enter your login'}
						{...register('username')}
					/>
					<Input
						id="password"
						type={FIELD.PASSWORD}
						label="Password"
						required={true}
						error={errors?.password?.message}
						placeholder="Enter your password"
						{...register('password')}
					/>
					<Button disabled={isPending} type={FIELD.SUBMIT}>
						Enter
					</Button>
				</form>
			</div>
		</div>
	)
}

export default Index
