import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {IGroupOrder} from 'interfaces/groupOrders.interface'

interface SelectedGroupOrdersState {
	groupOrders: IGroupOrder[]
}

const initialState: SelectedGroupOrdersState = {
	groupOrders: []
}

const selectedGroupOrdersSlice = createSlice({
	name: 'groupOrders',
	initialState,
	reducers: {
		addGroupOrder: (state, action: PayloadAction<IGroupOrder>) => {
			if (!state.groupOrders.find(i => i.id === action.payload.id)) {
				state.groupOrders.push(action.payload)
			}
		},
		removeGroupOrder: (state, action: PayloadAction<number>) => {
			state.groupOrders = state.groupOrders.filter(i => i.id !== action.payload)
		},
		clearGroupOrders: (state) => {
			state.groupOrders = []
		}
	}
})

export const {
	addGroupOrder,
	removeGroupOrder,
	clearGroupOrders
} = selectedGroupOrdersSlice.actions

export default selectedGroupOrdersSlice.reducer
