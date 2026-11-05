import SwalBase, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';
import 'animate.css';
import { Messages } from './config';

/** Kostay alert design (styles: scss/pages/sweetAlert.scss). Every helper below keeps its old signature. */
const ICONS: Record<SweetAlertIcon, string> = {
	success: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>',
	error: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5v10M12 19v.2" /></svg>',
	warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5v10M12 19v.2" /></svg>',
	info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9.5v10M12 4.8v.2" /></svg>',
	question:
		'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5" /></svg>',
};

// Keep the page scrollbar while an alert is open, so fixed elements (navbar) do not jump sideways.
const KostaySwal = SwalBase.mixin({
	scrollbarPadding: false,
	buttonsStyling: false,
	reverseButtons: true,
	showClass: { popup: 'kx-alert-show' },
	hideClass: { popup: 'kx-alert-hide' },
	customClass: {
		container: 'kx-alert-backdrop',
		popup: 'kx-alert',
		icon: 'kx-alert-icon',
		title: 'kx-alert-title',
		htmlContainer: 'kx-alert-text',
		actions: 'kx-alert-actions',
		confirmButton: 'kx-alert-btn kx-alert-btn--primary',
		cancelButton: 'kx-alert-btn kx-alert-btn--ghost',
	},
});

const clean = (value: unknown) => (typeof value === 'string' ? value.replace(/^Definer:\s*/, '') : value);

const Swal = {
	fire: (options: SweetAlertOptions) =>
		KostaySwal.fire({
			...options,
			title: clean(options.title) as string,
			text: clean(options.text) as string,
			...(options.icon && { iconHtml: ICONS[options.icon] }),
		}),
};

export const sweetErrorHandling = async (err: any) => {
	await Swal.fire({
		icon: 'error',
		text: err.message,
		showConfirmButton: false,
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		position: 'center',
		icon: 'success',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await Swal.fire({
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetConfirmAlert = (msg: string, buttons?: { confirm?: string; cancel?: string }) => {
	return new Promise(async (resolve) => {
		await Swal.fire({
			icon: 'question',
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			...(buttons?.confirm && { confirmButtonText: buttons.confirm }),
			...(buttons?.cancel && { cancelButtonText: buttons.cancel }),
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		await Swal.fire({
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonText: 'Login',
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		icon: 'success',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	Swal.fire({ text });
};

export const sweetErrorHandlingForAdmin = async (err: any) => {
	const errorMessage = err.message ?? Messages.error1;
	await Swal.fire({
		icon: 'error',
		text: errorMessage,
		showConfirmButton: false,
	});
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	const Toast = SwalBase.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: duration,
		timerProgressBar: true,
		customClass: {
			popup: 'kx-toast',
			icon: 'kx-toast-icon',
			title: 'kx-toast-title',
			timerProgressBar: 'kx-toast-progress',
		},
	});

	Toast.fire({
		icon: 'success',
		iconHtml: ICONS.success,
		title: clean(msg) as string,
	}).then(() => {
		if (enable_forward) {
			window.location.reload();
		}
	});
};
