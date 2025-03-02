import {allActions} from 'store/rootActions'
import {bindActionCreators} from 'redux'
import {useDispatch} from 'react-redux'
import {useMemo} from 'react'


export default () => {
	const dispatch = useDispatch()
	return useMemo(() => bindActionCreators(allActions, dispatch), [dispatch])
}
