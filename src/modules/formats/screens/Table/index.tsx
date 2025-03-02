import {yupResolver} from '@hookform/resolvers/yup'
import {
	Button,
	Card,
	DeleteButton,
	DeleteModal,
	EditButton,
	EditModal,
	Modal,
	Pagination,
	ReactTable,
	Form,
	NumberFormattedInput,
	PageTitle
} from 'components/index'
import {FIELD} from 'constants/fields'
import {formatSchema} from 'helpers/yup'
import {useAdd, useDetail, usePaginatedData, usePagination, useSearchParams, useUpdate} from 'hooks/index'
import {useEffect, useMemo} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {Column} from 'react-table'
import {decimalToInteger} from 'utilities/common'
import {Plus} from 'assets/icons'


const Index = () => {
	const {t} = useTranslation()
	const {page, pageSize} = usePagination()
	const {addParams, removeParams, paramsObject: {updateId = undefined}} = useSearchParams()

	const {data, totalPages, isPending: isLoading, refetch} = usePaginatedData<{ format: string, id: number }[]>(
		'products/formats',
		{
			page,
			page_size: pageSize
		}
	)

	const {
		handleSubmit: handleAddSubmit,
		reset: resetAdd,
		control: controlAdd,
		formState: {errors: addErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {format: ''},
		resolver: yupResolver(formatSchema)
	})

	const columns: Column<{ format: string, id: number }>[] = useMemo(() => [
		{
			Header: t('№'),
			accessor: (_: { format: string }, index: number) => ((page - 1) * pageSize) + (index + 1),
			style: {
				width: '3rem',
				textAlign: 'center'
			}
		},
		{
			Header: `${t('Formats')} (${t('mm')})`,
			accessor: (row) => decimalToInteger(row?.format || '')
		},
		{
			Header: t('Actions'),
			accessor: (row) => (
				<div className="flex items-start gap-lg">
					<EditButton id={row.id}/>
					<DeleteButton id={row.id}/>
				</div>
			)
		}
	], [page, pageSize])

	const {
		handleSubmit: handleEditSubmit,
		reset: resetEdit,
		control: controlEdit,
		formState: {errors: editErrors}
	} = useForm({
		mode: 'onTouched',
		defaultValues: {format: ''},
		resolver: yupResolver(formatSchema)
	})

	const {mutateAsync, isPending: isAdding} = useAdd('products/formats')
	const {mutateAsync: update, isPending: isUpdating} = useUpdate('products/formats/', updateId)
	const {data: detail, isPending: isDetailLoading} = useDetail<{
		format: string,
		id: number
	}>('products/formats/', updateId)

	useEffect(() => {
		if (detail?.format) {
			resetEdit({format: detail.format})
		}
	}, [detail, resetEdit])

	return (
		<>

			<PageTitle title="Formats">
				<Button icon={<Plus/>} onClick={() => addParams({modal: 'formats'})}>
					Add format
				</Button>
			</PageTitle>

			<Card>
				<ReactTable columns={columns} data={data} isLoading={isLoading}/>
			</Card>
			<Pagination totalPages={totalPages}/>

			<Modal title="Add format" id="formats" style={{height: '25rem'}}>
				<Form
					onSubmit={handleAddSubmit(async (data) => {
						await mutateAsync(data)
						resetAdd()
						removeParams('modal')
						await refetch()
					})}
				>
					<Controller
						control={controlAdd}
						name="format"
						render={({field}) => (
							<NumberFormattedInput
								id="format"
								label={`${t('Formats')} (${t('mm')})`}
								disableGroupSeparators={false}
								maxLength={4}
								allowDecimals={false}
								error={addErrors?.format?.message || ''}
								{...field}
							/>
						)}
					/>
					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isAdding}>
						Save
					</Button>
				</Form>
			</Modal>

			<EditModal isLoading={isDetailLoading} style={{height: '25rem'}}>
				<Form
					onSubmit={handleEditSubmit(async (data) => {
						await update(data)
						resetEdit()
						removeParams('modal', 'updateId')
						await refetch()
					})}
				>
					<Controller
						control={controlEdit}
						name="format"
						render={({field}) => (
							<NumberFormattedInput
								id="format"
								label={`${t('Formats')} (${t('mm')})`}
								disableGroupSeparators={false}
								maxLength={4}
								allowDecimals={false}
								error={editErrors?.format?.message || ''}
								{...field}
							/>
						)}
					/>
					<Button style={{marginTop: 'auto'}} type={FIELD.SUBMIT} disabled={isUpdating}>
						Edit
					</Button>
				</Form>
			</EditModal>

			<DeleteModal endpoint="products/formats/" onDelete={() => refetch()}/>
		</>
	)
}

export default Index
