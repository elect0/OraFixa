import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { idSchema, walkInSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ locals: { supabase, session }, url }) => {
	const dateParam = url.searchParams.get('date');
	const targetDate =
		dateParam && !isNaN(Date.parse(dateParam))
			? new Date(dateParam).toISOString().split('T')[0]
			: new Date().toISOString().split('T')[0];
	// REVIEW LATER

	const form = await superValidate(zod(walkInSchema));

	const startOfDay = new Date(targetDate + 'T00:00:00.000Z');
	const endOfDay = new Date(targetDate + 'T23:59:59.999Z');

	const appointmentsPromise = supabase
		.from('appointments')
		.select(
			`id,
        start_time,
        end_time,
        status,
		client_notes,
        profiles ( id, full_name, phone, notes ),
        services ( name, duration_minutes, price )`
		)
		.gte('start_time', startOfDay.toISOString())
		.lt('start_time', endOfDay.toISOString())
		.order('start_time', { ascending: true });

	const statsPromise = supabase.rpc('get_dashboard_stats', { p_date: targetDate });

	const weeklyRevenuePromise = supabase.rpc('get_weekly_revenue');

	const profilesPromise = supabase
		.from('profiles')
		.select('*')
		.order('full_name', { ascending: true });

	const servicesPromise = supabase.from('services').select('*');

	const [appointmentsResult, statsResult, weeklyRevenueResult, profilesResult, servicesResult] =
		await Promise.all([
			appointmentsPromise,
			statsPromise,
			weeklyRevenuePromise,
			profilesPromise,
			servicesPromise
		]);

	if (appointmentsResult.error || statsResult.error || weeklyRevenueResult.error) {
		console.error(
			'Eroare la încărcarea datelor:',
			appointmentsResult.error || statsResult.error || weeklyRevenueResult.error
		);
		throw error(500, 'A apărut o eroare la server.');
	}

	const kpisData = statsResult.data[0];
	console.log(weeklyRevenueResult);

	return {
		appointments: appointmentsResult.data || [],
		currentDate: targetDate,
		kpis: {
			revenue: {
				count: kpisData?.total_revenue || 0,
				percentage: kpisData?.revenue_change_pct
			},
			newClients: {
				count: kpisData?.new_clients_count || 0,
				percentage: kpisData?.new_clients_change_pct
			},
			noShows: {
				count: kpisData?.noshow_count || 0,
				percentage: kpisData?.noshow_change_pct
			}
		},
		weeklyRevenue: weeklyRevenueResult.data || [],
		clients: profilesResult.data || [],
		services: servicesResult.data || [],
		form,
		session
	};
};

export const actions: Actions = {
	markAsComplete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(idSchema));

		console.log(form.data.appointmentId);

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data, error } = await supabase
			.from('appointments')
			.update({ status: 'finalizata' })
			.eq('id', form.data.appointmentId);

		console.log(data);

		return { success: true };
	},
	markAsNoShow: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { error } = await supabase
			.from('appointments')
			.update({ status: 'neprezentat' })
			.eq('id', form.data.appointmentId);

		if (error) {
			return fail(500, { message: 'A apărut o eroare.' });
		}

		return { success: true };
	},
	cancelAppointment: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { error } = await supabase
			.from('appointments')
			.update({ status: 'anulata' })
			.eq('id', form.data.appointmentId);

		if (error) {
			return fail(500, { message: 'A apărut o eroare.' });
		}

		return { success: true };
	},
	addWalkInAppointment: async ({ request, locals: { supabase, session } }) => {
		const form = await superValidate(request, zod(walkInSchema));
		if (!form.valid) {
			console.log(form);
			return fail(400, { form });
		}

		const startTime = new Date(`${form.data.date.split('T')[0]}T${form.data.time}:00.000Z`);
		const endTime = new Date(startTime.getTime() + form.data.duration * 60 * 1000);

		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', session?.user.id)
			.single();

		if (!profile.is_admin) {
			return fail(401, { message: 'Neautorizat.' });
		}

		const walkInAppointment = {
			user_id: form.data.clientId,
			service_id: form.data.serviceId,
			start_time: startTime.toISOString(),
			end_time: endTime.toISOString(),
			client_notes: form.data.clientNotes,
			status: 'confirmata'
		};

		const { error } = await supabase.from('appointments').insert(walkInAppointment);
		if (error) {
			console.error('Eroare la INSERT programare:', error);
			return message(form, 'Programarea nu a fost confirmată!');
		}

		return message(form, 'Programarea a fost confirmată cu succes!');
	}
};
