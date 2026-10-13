import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface FormSelectOption {
	value: string | number;
	label: string;
}

interface FormSelectProps {
	value: string | number | null | undefined;
	options: FormSelectOption[];
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	/** id of the visible label, so screen readers name the button. */
	labelId?: string;
}

/**
 * Form dropdown that always opens below the field (a native <select> on macOS opens over it, centred on the
 * current choice). Same menu look as the Hosts / Stays sort menus (.sx-sort-menu).
 */
const FormSelect = ({ value, options, onChange, placeholder = 'Select', disabled, labelId }: FormSelectProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const selected = options.find((option) => String(option.value) === String(value));

	const choose = (option: FormSelectOption) => {
		setAnchorEl(null);
		onChange(String(option.value));
	};

	return (
		<>
			<button
				type="button"
				className={`sx-form-select${selected ? '' : ' is-empty'}`}
				aria-haspopup="listbox"
				aria-expanded={Boolean(anchorEl)}
				aria-labelledby={labelId}
				disabled={disabled}
				onClick={(e) => setAnchorEl(e.currentTarget)}
			>
				<span>{selected ? selected.label : placeholder}</span>
				<ExpandMoreIcon aria-hidden="true" />
			</button>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				PaperProps={{ className: 'sx-sort-menu', style: { minWidth: anchorEl?.offsetWidth } }}
				disableScrollLock
			>
				{options.map((option) => (
					<MenuItem
						key={option.value}
						selected={String(option.value) === String(value)}
						onClick={() => choose(option)}
					>
						{option.label}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default FormSelect;
