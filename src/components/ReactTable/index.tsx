import {Loader} from 'components/index'
import {CSSProperties} from 'react'
import classes from './styles.module.scss'
import {useTable, TableOptions, ColumnInstance, HeaderGroup, Column} from 'react-table'
import classNames from 'classnames'
import {useTranslation} from 'react-i18next'


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
}

type ICustomColumn<T extends object> = Column<T> & {
	style?: CSSProperties;
	headerRowSpan?: number;
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
	                                                           spacing = true,
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
								headerGroup.headers.map((column: ICustomColumnProps<T>, index: number) => (
									<th
										{...column.getHeaderProps()}
										style={{...column.style}}
										rowSpan={column.headerRowSpan}
										key={index}
									>
										{column.render('Header')}
									</th>
								))
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
									prepareRow(row)
									return (
										<tr
											onClick={() => handleRow?.(row.original.id)}
											className={classes.row}
											{...row.getRowProps()}
											key={index}
										>
											{
												row.cells.map((cell, index) => {
													const customColumn = cell.column as ICustomColumnProps<T>
													return (
														<td
															{...cell.getCellProps()}
															style={{...customColumn.style}}
															key={index}
														>
															{cell.render('Cell')}
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