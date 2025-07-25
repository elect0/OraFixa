<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { page } from '$app/state';
	let session = $derived(page.data.session);
	let user = $derived(page.data);

	import {
		Scissors,
		User,
		Star,
		MapPin,
		X,
		Menu,
		CalendarDays,
		Award,
		LogOut
	} from 'lucide-svelte';

	interface NavItem {
		id: string;
		label: string;
		icon: any;
	}

	let userInitials = $derived.by(() => {return user.user.user_metadata.full_name ? user.user?.user_metadata.full_name.charAt(0).toUpperCase() : '?'})
	let userName = $derived.by(() => {return user.user.user_metadata.full_name ? user.user?.user_metadata.full_name.split(' ')[0] : 'Oaspete'});

	let isMobileMenuOpen = $state(false);

	const toggleMobileMenu = () => {
		isMobileMenuOpen = !isMobileMenuOpen;
	};
	const navItems: NavItem[] = [
		{ id: 'servicii', label: 'Servicii', icon: Scissors },
		{ id: 'despre', label: 'Despre', icon: User },
		{ id: 'recenzii', label: 'Recenzii', icon: Star },
		{ id: 'contact', label: 'Contact', icon: MapPin }
	];
</script>

<nav
	class="fixed left-0 right-0 top-0 z-50 border-b-2 border-amber-600/20 bg-white shadow-xl backdrop-blur-xl"
>
	<div class="container mx-auto px-4 lg:px-6">
		<div class="flex h-20 items-center justify-between">
			<div class="flex items-center space-x-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg"
				>
					<Scissors class="h-7 w-7 text-white" />
				</div>
				<div class="flex flex-col">
					<a
						href="/"
						class="text-2xl font-black text-stone-900 transition-all duration-300 hover:scale-105 hover:text-amber-600"
					>
						Cip Barbershop
					</a>
					<span class="text-xs font-medium text-stone-500">Bailesti</span>
				</div>
			</div>
			<div class="flex items-center space-x-4">
				<div class="hidden md:block">
					<DropdownMenu>
						<DropdownMenuTrigger>
							{#snippet child({ props })}
								<Button
									variant="ghost"
									{...props}
									class="flex items-center space-x-3 px-4 py-2 transition-all duration-300 hover:scale-105 hover:bg-stone-100"
								>
									<Avatar class="h-10 w-10 border-2 border-amber-600 shadow-lg">
										<AvatarFallback class="bg-amber-600 text-white">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<span class="text-sm font-semibold text-stone-700">Salut, {userName}</span>
								</Button>
							{/snippet}
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="center"
							class="ml-5 mt-2 w-56 border-2 border-stone-100 shadow-xl"
						>
							<a href="/cont/programari">
								<DropdownMenuItem class="cursor-pointer py-3 hover:bg-amber-50">
									<CalendarDays class="mr-3 h-5 w-5 text-amber-600" />
									<span class="font-medium"> Programarile mele </span>
								</DropdownMenuItem>
							</a>
							<a href="/cont">
								<DropdownMenuItem class="cursor-pointer py-3 hover:bg-amber-50">
									<User class="mr-3 h-5 w-5 text-amber-600" />
									<span class="font-medium"> Contul meu </span>
								</DropdownMenuItem>
							</a>
							<DropdownMenuSeparator />
							<DropdownMenuItem class="cursor-pointer py-3 text-red-600 hover:bg-red-50">
								<form method="POST" action="/logout">
									<button type="submit" class="flex flex-row items-center">
										<LogOut class="mr-5 h-5 w-5 text-amber-600" />
										<span class="font-medium"> Deconectare </span>
									</button>
								</form>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<button
					onclick={toggleMobileMenu}
					class="rounded-xl p-3 text-stone-700 transition-all duration-300 hover:scale-105 hover:bg-stone-100 md:hidden"
				>
					{#if isMobileMenuOpen}
						<X class="h-6 w-6" />
					{:else}
						<Menu class="h-6 w-6" />
					{/if}
				</button>
			</div>
		</div>
		{#if isMobileMenuOpen}
			<div class="border-t-2 border-amber-600/20 bg-white shadow-2xl md:hidden">
				<div class="px-4 py-6">
					<div class="flex flex-col space-y-2">
						<div class="mt-4pt-4">
							<div class="space-y-3">
								<div
									class="mx-2 flex items-center rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-stone-50 px-4 py-3"
								>
									<Avatar class="mr-4 h-10 w-10 border-2 border-amber-600 shadow-lg">
										<AvatarFallback class="bg-amber-600 text-sm font-bold text-white">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<span class="font-bold text-stone-800">Salut, {userName}</span>
								</div>
								<a
									href="/cont"
									class="duration_300 group flex w-full items-center rounded-xl px-4 py-4 font-semibold text-stone-700 transition-all hover:bg-amber-50 hover:text-amber-600"
								>
									<CalendarDays
										class="mr-4 h-5 w-5 text-amber-600 transition-transform group-hover:scale-110"
									/>
									Programarile Mele
								</a>
								<a
									href="/cont"
									class="group flex w-full items-center rounded-xl px-4 py-4 font-semibold text-stone-600 transition-all duration-300 hover:bg-amber-50 hover:text-amber-600"
								>
									<User
										class="mr-4 h-5 w-5 text-amber-600 transition-transform group-hover:scale-110"
									/>
									Contul meu
								</a>
								<form method="POST" action="/logout">
									<button
										class="group flex w-full items-center rounded-xl px-4 py-4 font-semibold text-stone-600 transition-all duration-300 hover:bg-amber-50 hover:text-amber-600"
									>
										<LogOut
											class="mr-4 h-5 w-5 text-amber-600 transition-transform group-hover:scale-110"
										/>
										Deconectare
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</nav>
