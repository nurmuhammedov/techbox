import {useLogin} from 'modules/authentication/hooks'
import {ILoginForm} from 'interfaces/yup.interface'
import {yupResolver} from '@hookform/resolvers/yup'
import {useTranslation} from 'react-i18next'
import styles from './styles.module.scss'
import {Button, Input} from 'components'
import {useForm} from 'react-hook-form'
import {loginSchema} from 'helpers/yup'
import {LoginLogo} from 'assets/icons'
import {FIELD} from 'constants/fields'


const Index = () => {
	const {t} = useTranslation()
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
