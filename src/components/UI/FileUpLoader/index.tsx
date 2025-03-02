import {useCallback, useEffect, forwardRef, useState} from 'react'
import {useDropzone, FileWithPath} from 'react-dropzone'
import {IFIle} from 'interfaces/form.interface'
import {Delete, Download} from 'assets/icons'
import {useTranslation} from 'react-i18next'
import {showMessage} from 'utilities/alert'
import styles from './styles.module.scss'
import {interceptor} from 'libraries'
import classNames from 'classnames'
import {Input} from 'components'


interface FileUploaderProps {
	onChange?: (file: IFIle | IFIle[] | undefined) => void
	onBlur?: () => void
	value: IFIle | IFIle[] | undefined | null
	multi?: boolean
	id: string
	disabled?: boolean
	label?: string
	url?: string
	error?: string
	type?: 'pdf' | 'image'
}

const Index = forwardRef<HTMLInputElement, FileUploaderProps>(({
	                                                               onBlur,
	                                                               onChange,
	                                                               value,
	                                                               label,
	                                                               url = 'products/product-logo',
	                                                               disabled = false,
	                                                               error,
	                                                               id,
	                                                               type = 'pdf',
	                                                               multi = false
                                                               }, ref) => {
		const {t} = useTranslation()
		const [isLoading, setIsLoading] = useState<boolean>(disabled)
		const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(disabled)
		const [percentage, setPercentage] = useState<number>(0)

		const onDrop = useCallback(
			(acceptedFiles: FileWithPath[]) => {
				if (!isLoading) {
					acceptedFiles.map((item) => {
						setIsLoading(true)
						const formData = new FormData()
						formData.append('file', item)
						formData.append('name', item.name)
						interceptor
							.post(url, formData, {
								headers: {
									'Content-Type': 'multipart/form-data'
								},
								'onUploadProgress': (progressEvent) => {
									const total = progressEvent.total || 0
									const loaded = progressEvent.loaded || 0
									setPercentage(Math.round((loaded / total) * 100))
								}
							})
							.then((res) => {
								showMessage(`${res.data.name} ${t('File successfully accepted')}`, 'success')
								if (multi) {
									if (Array.isArray(value) && value) {
										onChange?.([...value, res.data] as IFIle[])
									} else {
										onChange?.([res.data])
									}
								} else {
									onChange?.(res.data)
								}
							})
							.catch(() => {
								showMessage(`${item.name} ${t('File not accepted')}`, 'error')
							})
							.finally(() => {
								setIsLoading(false)
							})
					})
				}
			},
			[isLoading, multi, onChange, t, value]
		)


		const {
			getRootProps,
			getInputProps,
			isDragActive,
			fileRejections
		} = useDropzone({
			onDrop,
			accept: type === 'pdf' ? {'application/pdf': ['.pdf']} : {
				'image/jpeg': ['.jpg', '.jpeg'],
				'image/png': ['.png']
			},
			maxFiles: 1,
			maxSize: 10 * 1024 * 1024
		})


		useEffect(() => {
			if (fileRejections.length > 0) {
				fileRejections.map((item) => {
					item?.errors?.map((error) => {
						if (error.code === 'too-many-files') {
							showMessage(t('Send each file separately'))
						} else if (error.code === 'file-too-large') {
							showMessage(t('File must not exceed 10 mb'))
						} else if (error.code === 'file-invalid-type') {
							if (type === 'pdf') {
								showMessage(t('Only .pdf files are accepted'))
							} else if (type === 'image') {
								showMessage(t('Only .jpg, .png, .jpeg files are accepted'))
							}
						}
					})
				})
			}
		}, [fileRejections, t, type])

		const handleDelete = (id: string | number) => {
			if (id && !isDeleteLoading && !isLoading && !!onChange) {
				setIsDeleteLoading(true)
				setIsLoading(true)
				interceptor
					.delete(`${url}/${id}`)
					.then(() => {
						if (Array.isArray(value)) {
							const newValue = value.filter(i => i.id !== id)
							if (newValue.length === 0) {
								onChange?.(undefined)
							} else {
								onChange?.(newValue as IFIle[])
							}
						} else {
							onChange?.(undefined)
						}
						showMessage(`${t('File successfully removed')}`, 'success')
					})
					.finally(() => {
						setIsDeleteLoading(false)
						setIsLoading(false)
					})
			}
		}

		const handleDownload = (file?: string) => {
			if (file) window.open(file, '_blank')
		}

		return (
			<Input
				id={id}
				label={label}
				error={error}
			>
				<div
					className={
						classNames(styles.root, {
							[styles.isLoading]: isLoading || !onChange,
							[styles.error]: !!error,
							[styles.disabled]: disabled
						})
					}
				>
					{
						multi || Array.isArray(value) ? <>
								{
									((Array.isArray(value) && value.length < 10) || !value) &&
									<div className={styles.input} {...getRootProps()}>
										<input ref={ref} {...getInputProps()} onBlur={onBlur}/>
										{
											(isLoading && !isDeleteLoading) ? (
												<p><span>{percentage}% - {t('Loading...')}</span></p>
											) : isDragActive ?
												(
													<p><span>{t('Drop your files')}</span></p>
												) :
												(
													<p>
														<span>{t('Upload a file')}</span> ({type === 'pdf' ? '.pdf' : '.jpg, .png, .jpeg'} - {t('up to 10 mb')})
													</p>
												)
										}
									</div>
								}
								{
									Array.isArray(value) && value &&
									<div className={styles.wrapper}>
										{
											value?.map((item: IFIle, index) => {
												return (
													<div key={index} className={styles.values}>
														<div className={styles.value}>
															<Input
																id={item.id as unknown as string}
																value={item.name}
																disabled={true}
															/>
														</div>
														{
															!!onChange &&
															<div
																className={classNames(styles.icon, styles.delete, {[styles.isDelete]: isDeleteLoading})}
																onClick={() => handleDelete(item.id)}
															>
																<Delete/>
															</div>
														}
														<div className={styles.icon}
														     onClick={() => handleDownload(item.file)}>
															<Download/>
														</div>
													</div>
												)
											})
										}
									</div>
								}
							</> :
							value ?
								<div className={styles.values}>
									<div className={styles.value}>
										{
											type === 'image' ?
												<img
													style={{width: '250px', maxWidth: '100%', height: 'auto'}}
													src={value.file}
													alt="Image"
												/> :
												<Input
													id={value.id as unknown as string}
													value={value.name}
													disabled={true}
												/>
										}
									</div>
									{
										!!onChange &&
										<div
											className={classNames(styles.icon, styles.delete, {[styles.isDelete]: isDeleteLoading})}
											onClick={() => handleDelete(value.id)}
										>
											<Delete/>
										</div>
									}
									<div className={styles.icon} onClick={() => handleDownload(value.file)}>
										<Download/>
									</div>
								</div> :
								<div className={styles.input} {...getRootProps()}>
									<input ref={ref} {...getInputProps()} onBlur={onBlur}/>
									{
										(isLoading && !isDeleteLoading) ?
											(
												<p><span>{percentage}% - {t('Loading...')}</span></p>
											) : isDragActive ?
												(
													<p>{t('Drop your files')}</p>
												) :
												(
													<p>
														<span>{t('Upload a file')}</span> ({type === 'pdf' ? '.pdf' : '.jpg, .png, .jpeg'} - {t('up to 10 mb')})
													</p>
												)
									}
								</div>
					}
				</div>
			</Input>
		)
	}
)

export default Index
