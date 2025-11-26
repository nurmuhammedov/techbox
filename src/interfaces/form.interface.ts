import React, {InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes} from 'react'
import {Props as SelectProps} from 'react-select'
import {BUTTON_THEME} from 'constants/fields'

// Input Interface
interface IFieldProperties {
	id: string | number;
	type?: string;
	error?: string | React.ReactNode;
	label?: string;
	textarea?: boolean;
	autocomplete?: boolean;
	yellowLabel?: boolean;
	mini?: boolean;
	err?: boolean;
	required?: boolean;
	radius?: boolean,
	icon?: React.ReactNode;
	iconPosition?: 'right' | 'left';
	handleIcon?: () => void;
	handleDelete?: () => void;
}

type IField = InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement> & IFieldProperties;

// Button Interface
interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
	theme?: BUTTON_THEME,
	mini?: boolean,
	navigate?: string,
	icon?: React.ReactNode,
	iconPosition?: 'left' | 'right',
}

// Select Option Interface
interface ISelectOption {
	value: string | number;
	label: string | number;
	material?: number;
	weight_1x1?: string;
	remaining_amount?: string;
	amount?: string;
	icon?: React.ReactNode;
}

// Select Interface
interface ISelect extends SelectProps<ISelectOption> {
	id: string;
	options: ISelectOption[];
	placeholder?: string;
	yellowLabel?: boolean;
	icon?: React.ReactNode;
	handleOnChange?: (e: string | number | boolean | string[] | number[] | boolean[] | null) => void;
	disabled?: boolean;
	label?: string;
	handleDelete?: () => void;
	error?: string;
	top?: boolean;
}

interface IFIle {
	name: string;
	id: number;
	file: string;
}

export type {IButton, IField, ISelectOption, ISelect, IFIle}
