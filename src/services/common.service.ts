import {AxiosResponse} from 'axios'
import {IListResponse} from 'interfaces/configuration.interface'
import {interceptor} from 'libraries'


export const CommonService = {
	getPaginatedData: async <T>(endpoint: string, params = {}): Promise<IListResponse<T>> => {
		const response: AxiosResponse<IListResponse<T>> = await interceptor.get(endpoint, {params})
		return response.data
	},

	async addData<T, TResponse>(endpoint: string, data: T) {
		const res = await interceptor.post<TResponse>(endpoint, data)
		return res.data
	},

	async updateData<T, TResponse>(endpoint: string, data: T, id: string) {
		const res = await interceptor.put<TResponse>(endpoint + id, data)
		return res.data
	},

	async partialUpdateData<T, TResponse>(endpoint: string, data: T, id: string) {
		const res = await interceptor.patch<TResponse>(endpoint + id, data)
		return res.data
	},

	async deleteData(endpoint: string, id: string | number): Promise<void> {
		const res = await interceptor.delete(endpoint + id)
		return res.data
	},

	async getDetail<T>(endpoint: string, id: string, params = {}): Promise<T> {
		const res = await interceptor.get<T>(endpoint + id, {params})
		return res.data
	},

	async getData<T>(endpoint: string, params = {}): Promise<T> {
		const res = await interceptor.get<T>(endpoint, {params})
		return res.data
	}
}