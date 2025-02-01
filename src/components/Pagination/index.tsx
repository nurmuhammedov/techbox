import {FC} from 'react'
import {Select} from 'components'
import {usePagination} from 'hooks'
import {SelectIcon} from 'assets/icons'
import styles from './styles.module.scss'
import ReactPaginate from 'react-paginate'
import {getSelectValue} from 'utilities/common'
import {paginationOptions} from 'helpers/options'


interface IProps {
	totalPages?: number
	pageSizeName?: string
	pageName?: string
	mini?: boolean
}

const Index: FC<IProps> = ({totalPages = 1, pageName, pageSizeName, mini = false}) => {
	const {onPageChange, onPageSizeChange, pageSize, page} = usePagination({page: pageSizeName, pageSize: pageName})

	const handlePageClick = (event: { selected: number }): void => {
		onPageChange(event.selected + 1)
	}

	return (
		<div className={styles.root}>
			<ReactPaginate
				breakLabel="..."
				nextLabel={<SelectIcon/>}
				onPageChange={handlePageClick}
				pageRangeDisplayed={mini ? 2 : 4}
				forcePage={page - 1}
				marginPagesDisplayed={mini ? 1 : 3}
				pageCount={totalPages}
				previousLabel={<SelectIcon/>}
				renderOnZeroPageCount={null}
				containerClassName={styles.pagination}
				previousClassName={styles.previous}
				nextClassName={styles.next}
				pageClassName={styles.page}
				breakClassName={styles.page}
				pageLinkClassName={styles.link}
				nextLinkClassName={styles.link}
				previousLinkClassName={styles.link}
				breakLinkClassName={styles.link}
				activeClassName={styles.active}
			/>

			<Select
				top={true}
				id="pagination"
				options={paginationOptions}
				value={getSelectValue(paginationOptions, pageSize)}
				defaultValue={getSelectValue(paginationOptions, pageSize)}
				handleOnChange={(e) => onPageSizeChange(e as number)}
			/>
		</div>
	)
}

export default Index