import {Loader} from 'components/index'
import {CSSProperties, ReactNode} from 'react'
import classes from './styles.module.scss'
import {Column, ColumnInstance, HeaderGroup, TableOptions, useTable} from 'react-table'
import classNames from 'classnames'
import {useTranslation} from 'react-i18next'
import useCustomSearchParams from 'hooks/useSearchParams'


interface ICustomProps {
	isLoading?: boolean;
	screen?: boolean;
	spacing?: boolean;
	className?: string;
	handleRow?: (id: string | number) => void;
}

type ICustomColumnProps<T extends object> = ColumnInstance<T> & {
	style?: CSSProperties;
	headerRowSpan?: number;
	dynamicFilter?: string;
	rowClassName?: (row: T) => string;
}

type ICustomColumn<T extends object> = Column<T> & {
	style?: CSSProperties;
	headerRowSpan?: number;
	dynamicFilter?: string;
	rowClassName?: (row: T) => string;
}

type ICustomHeaderGroup<T extends object> = HeaderGroup<T> & {
	style?: CSSProperties;
	headerRowSpan?: number;
}

interface ITableOptions<T extends object> extends TableOptions<T>, ICustomProps {
	columns: ICustomColumn<T>[];
	data: T[];
}

const Index = <T extends object & { id: string | number }>({
	                                                           columns,
	                                                           data,
	                                                           isLoading,
	                                                           className,
	                                                           screen = true,
	                                                           spacing = false,
	                                                           handleRow
                                                           }: ITableOptions<T>) => {
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow
	} = useTable<T>({
		columns,
		data
	})

	const {t} = useTranslation()
	const {paramsObject, addParams} = useCustomSearchParams()

	const currentOrdering = paramsObject.ordering ? String(paramsObject.ordering).split(',') : []

	const handleSort = (field: string) => {
		let newOrdering = [...currentOrdering]
		const ascParams = field
		const descParams = `-${field}`

		if (newOrdering.includes(ascParams)) {
			newOrdering = newOrdering.map(item => item === ascParams ? descParams : item)
		} else if (newOrdering.includes(descParams)) {
			newOrdering = newOrdering.filter(item => item !== descParams)
		} else {
			newOrdering.push(ascParams)
		}

		addParams({ordering: newOrdering.join(',')})
	}

	const SortIcon = ({direction}: { direction: 'asc' | 'desc' | 'none' }) => {
		return (
			<div className={classes.sortIcons}>
				<svg
					className={classNames(classes.icon, {[classes.active]: direction === 'asc'})}
					width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
					strokeLinecap="round" strokeLinejoin="round">
					<polyline points="18 15 12 9 6 15"></polyline>
				</svg>
				<svg
					className={classNames(classes.icon, {[classes.active]: direction === 'desc'})}
					width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
					strokeLinecap="round" strokeLinejoin="round">
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</div>
		)
	}

	return (
		<div className={classNames(classes.root, className, {
			[classes.screen]: screen,
			[classes.loader]: isLoading,
			[classes.empty]: !(data && data.length)
		})}>
			<table {...getTableProps()}>
				<thead>
				{
					headerGroups.map((headerGroup: ICustomHeaderGroup<T>, index: number) => (
						<tr {...headerGroup.getHeaderGroupProps()} className={classes.row} key={index}>
							{
								headerGroup.headers.map((column: ICustomColumnProps<T>, idx: number) => {
									let sortDirection: 'asc' | 'desc' | 'none' = 'none'
									if (column.dynamicFilter) {
										if (currentOrdering.includes(column.dynamicFilter)) sortDirection = 'asc'
										if (currentOrdering.includes(`-${column.dynamicFilter}`)) sortDirection = 'desc'
									}

									return (
										<th
											{...column.getHeaderProps()}
											style={{
												...column.style,
												cursor: column.dynamicFilter ? 'pointer' : 'default'
											}}
											rowSpan={column.headerRowSpan}
											key={idx}
											onClick={() => column.dynamicFilter && handleSort(column.dynamicFilter)}
										>
											<div className={classes.headerContent}>
												{column.render('Header') as ReactNode}
												{column.dynamicFilter && <SortIcon direction={sortDirection}/>}
											</div>
										</th>
									)
								})
							}
						</tr>
					))
				}
				</thead>
				<tbody {...getTableBodyProps()}>
				{
					isLoading ? (
						<tr>
							<td colSpan={columns.length}>
								<Loader/>
							</td>
						</tr>
					) : data && data.length ? (
						<>
							{
								spacing && (
									<tr className={classes.spacing}>
										<td colSpan={columns.length}></td>
									</tr>
								)
							}
							{
								rows.map((row, index) => {
									const rowClassFromColumn =
										columns
											.map(col => col.rowClassName?.(row.original))
											.filter(Boolean)
											.join(' ')

									prepareRow(row)
									return (
										<tr
											onClick={() => handleRow?.(row.original.id)}
											className={classNames(
												classes.row
											)}
											style={{background: rowClassFromColumn}}
											{...row.getRowProps()}
											key={index}
										>
											{
												row.cells.map((cell, idx) => {
													const customColumn = cell.column as ICustomColumnProps<T>
													return (
														<td
															{...cell.getCellProps()}
															style={{...customColumn.style}}
															key={idx}
														>
															{cell.render('Cell') as ReactNode}
														</td>
													)
												})
											}
										</tr>
									)
								})
							}
						</>
					) : (
						<tr>
							<td colSpan={columns.length}>{t('Nothing found')}</td>
						</tr>
					)
				}
				</tbody>
			</table>
		</div>
	)
}

export default Index