import styles from './styles.module.scss'
import {CSSProperties, FC, ReactNode} from 'react'
import classNames from 'classnames'


interface IProperties {
	style?: CSSProperties;
	className?: string;
	second?: boolean;
	l0?: ReactNode;
	l1?: ReactNode;
	l2?: ReactNode;
	l3?: ReactNode;
	l4?: ReactNode;
	l5?: ReactNode;
	x?: ReactNode;
	y?: ReactNode;
}

const Index: FC<IProperties> = ({style, className, l0, l1, l2, l3, l4, l5, x, y, second = false}) => {
	return (
		<div className={classNames(styles.root, className)} style={style}>
			{
				second ?
					<div className={styles.second}>
						<div className={styles.container}>{y || null}</div>
						<div className={styles.container}>{x || null}</div>
						<div className={styles.container}></div>
					</div> :
					<div className={styles.diagram}>
						<div className={styles.container}></div>
						<div className={styles.container}>{l1 || null}</div>
						<div className={styles.container}>{l5 || null}</div>
						<div className={styles.container}>{l0 || null}</div>
						<div className={styles.container}>{l2 || null}</div>
						<div className={styles.container}></div>
						<div className={styles.container}>{l3 || null}</div>
						<div className={styles.container}>{l4 || null}</div>
						<div className={styles.container}></div>
					</div>
			}
		</div>
	)
}

export default Index