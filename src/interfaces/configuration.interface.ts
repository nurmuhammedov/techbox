import React from 'react'


interface RoleOrder {
	[key: string]: number
}

interface IMenuItem {
	id: string
	label: string
	icon?: () => React.ReactNode
	href: string
	allowedRoles: string[]
	order: RoleOrder
}

interface IListResponse<T> {
	count: number
	num_pages: number
	results: T
}

interface IIDName {
	id: number
	name: string
}

export type {
	IIDName,
	IMenuItem,
	IListResponse
}