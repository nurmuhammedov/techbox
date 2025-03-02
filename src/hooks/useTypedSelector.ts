import {TypedUseSelectorHook, useSelector} from 'react-redux'
import {TypeRootState} from 'store'


const useTypedSelector: TypedUseSelectorHook<TypeRootState> = useSelector

export default useTypedSelector
