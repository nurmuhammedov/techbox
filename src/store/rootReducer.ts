import ordersReducer from 'store/orders/orders.slice'
import groupOrders from 'store/group-orders/groupOrders.slice'


export const rootReducer = {
	orders: ordersReducer,
	groupOrders
}
