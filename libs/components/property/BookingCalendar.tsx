import React, { useEffect, useRef, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { BookedRange } from '../../types/booking/booking';

/** All dates are plain local YYYY-MM-DD strings (never toISOString); string comparison orders them correctly. */
const pad = (value: number) => String(value).padStart(2, '0');
const ymd = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface BookingCalendarProps {
	/** Which field this calendar edits. */
	mode: 'checkIn' | 'checkOut';
	value: string;
	checkIn: string;
	checkOut: string;
	/** Earliest selectable date (YYYY-MM-DD). */
	min: string;
	bookedRanges: BookedRange[];
	onSelect: (value: string) => void;
	onClose: () => void;
}

/** One-month calendar for the stay booking box: past and taken days are disabled, the chosen stay is highlighted. */
const BookingCalendar = ({
	mode,
	value,
	checkIn,
	checkOut,
	min,
	bookedRanges,
	onSelect,
	onClose,
}: BookingCalendarProps) => {
	const start = value || (mode === 'checkOut' && checkIn) || min;
	const [view, setView] = useState(() => {
		const [year, month] = start.split('-').map(Number);
		return { year, month: month - 1 };
	});
	const boxRef = useRef<HTMLDivElement>(null);

	/** LIFECYCLES **/
	useEffect(() => {
		// Close on outside click or Escape.
		const onPointer = (event: MouseEvent) => {
			const target = event.target as Node;
			if (boxRef.current && !boxRef.current.contains(target) && !(target as HTMLElement).closest?.('.sx-date-field'))
				onClose();
		};
		const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
		document.addEventListener('mousedown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [onClose]);

	/** HELPERS **/
	// A night is taken when it falls inside [checkIn, checkOut) of an active booking.
	const isNightTaken = (day: string) => bookedRanges.some((r) => day >= r.checkIn && day < r.checkOut);
	// Check-out is allowed only if no taken night lies between the chosen check-in and that day.
	const crossesBooking = (day: string) => !!checkIn && bookedRanges.some((r) => checkIn < r.checkOut && day > r.checkIn);
	const isDisabled = (day: string) => day < min || (mode === 'checkIn' ? isNightTaken(day) : crossesBooking(day));

	const minYearMonth = min.slice(0, 7);
	const viewYearMonth = `${view.year}-${pad(view.month + 1)}`;
	const firstWeekday = new Date(view.year, view.month, 1).getDay();
	const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
	const cells: (string | null)[] = [
		...Array.from({ length: firstWeekday }, () => null),
		...Array.from({ length: daysInMonth }, (_, i) => ymd(view.year, view.month, i + 1)),
	];
	const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

	const shiftMonth = (step: number) =>
		setView(({ year, month }) => {
			const next = new Date(year, month + step, 1);
			return { year: next.getFullYear(), month: next.getMonth() };
		});

	return (
		<div
			className={`sx-calendar is-${mode}`}
			ref={boxRef}
			role="dialog"
			aria-label={mode === 'checkIn' ? 'Choose check-in' : 'Choose check-out'}
		>
			<div className="sx-calendar-head">
				<button
					type="button"
					aria-label="Previous month"
					disabled={viewYearMonth <= minYearMonth}
					onClick={() => shiftMonth(-1)}
				>
					<ChevronLeftIcon />
				</button>
				<strong>{monthLabel}</strong>
				<button type="button" aria-label="Next month" onClick={() => shiftMonth(1)}>
					<ChevronRightIcon />
				</button>
			</div>
			<div className="sx-calendar-grid">
				{WEEKDAYS.map((weekday) => (
					<span key={weekday} className="sx-calendar-weekday">
						{weekday}
					</span>
				))}
				{cells.map((day, index) => {
					if (!day) return <span key={`blank-${index}`} />;
					const disabled = isDisabled(day);
					const selected = day === checkIn || day === checkOut;
					const inRange = !!checkIn && !!checkOut && day > checkIn && day < checkOut;
					const taken = isNightTaken(day);
					return (
						<button
							type="button"
							key={day}
							disabled={disabled}
							className={`${selected ? 'is-selected' : ''} ${inRange ? 'is-in-range' : ''} ${taken ? 'is-taken' : ''}`}
							aria-pressed={selected}
							aria-label={day}
							onClick={() => onSelect(day)}
						>
							{Number(day.slice(8))}
						</button>
					);
				})}
			</div>
			<div className="sx-calendar-foot">
				<span>
					<i className="is-taken" /> Booked
				</span>
				{value && (
					<button type="button" onClick={() => onSelect('')}>
						Clear
					</button>
				)}
			</div>
		</div>
	);
};

export default BookingCalendar;
