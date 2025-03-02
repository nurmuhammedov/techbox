import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {IOrderDetail} from 'interfaces/orders.interface'


interface HistoryState {
	orders: IOrderDetail[]
}

const initialState: HistoryState = {
	orders: []
}

export const historySlice = createSlice({
	name: 'orders',
	initialState,
	reducers: {
		addOrder: (state, action: PayloadAction<IOrderDetail>) => {
			const exists = state.orders.some(order => order.id == action.payload.id)
			if (!exists) {
				state.orders.push(action.payload)
			}
		},
		deleteOrder: (state, action: PayloadAction<number>) => {
			state.orders = state.orders.filter(order => order.id != action.payload)
		},
		updateOrder: (state, action: PayloadAction<IOrderDetail>) => {
			const index = state.orders.findIndex(order => order.id == action.payload.id)
			if (index !== -1) {
				state.orders[index] = action.payload
			}
		},
		clearOrders: (state) => {
			state.orders = []
		}
	}
})

export const {
	addOrder,
	deleteOrder,
	updateOrder,
	clearOrders
} = historySlice.actions

export default historySlice.reducer
