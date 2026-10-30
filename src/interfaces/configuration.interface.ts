import React from 'react'


interface RoleOrder {
	[key: string]: number
}

interface IMenuChild {
	label: string
	href: string
}

interface IMenuItem {
	id: string
	label: string
	icon?: React.ElementType
	href: string
	items?: IMenuChild[]
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
	end_date: string
	material_name?: string
}

export type {
	IIDName,
	IMenuChild,
	IMenuItem,
	IListResponse
}