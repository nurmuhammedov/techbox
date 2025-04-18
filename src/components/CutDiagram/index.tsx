import styles from './styles.module.scss'
import {CSSProperties, FC, ReactNode} from 'react'
import classNames from 'classnames'


interface IProperties {
	style?: CSSProperties;
	className?: string;
	count?: ReactNode;
	x?: ReactNode;
	l1?: ReactNode;
	l2?: ReactNode;
	length?: ReactNode;
	sections?: number;
}

const Index: FC<IProperties> = ({style, className, x, l1, count, length, sections = 2}) => {
	return (
		<div
			className={classNames({[styles.root]: sections == 2}, {[styles.second]: sections == 3}, {[styles.third]: sections == 4}, className)}
			style={style}>
			<div className={styles.diagram}>
				<div className={styles.container}></div>
				<div className={styles.container}>{l1 || null}</div>
				<div className={styles.container}>{l1 || null}</div>
				{
					(sections == 3 || sections == 4) &&
					<div className={styles.container}>{l1 || null}</div>
				}
				{
					sections == 4 &&
					<div className={styles.container}>{l1 || null}</div>
				}
				<div className={styles.container}>{length || null}</div>
				<div className={styles.container}>{count || null}</div>
				<div className={styles.container}>{count || null}</div>
				{
					(sections == 3 || sections == 4) &&
					<div className={styles.container}>{count || null}</div>
				}
				{
					sections == 4 &&
					<div className={styles.container}>{count || null}</div>
				}
				<div className={styles.container}></div>
				<div className={styles.container}>{x || null}</div>
			</div>
		</div>
	)
}

export default Index