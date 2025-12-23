import {addOrder, clearOrders, deleteOrder, updateOrder} from './orders/orders.slice'
import {
	addGroupOrder,
	removeGroupOrder,
	clearGroupOrders
} from './group-orders/groupOrders.slice'


export const allActions = {
	addGroupOrder,
	removeGroupOrder,
	clearGroupOrders,
	clearOrders,
	deleteOrder,
	updateOrder,
	addOrder
}
