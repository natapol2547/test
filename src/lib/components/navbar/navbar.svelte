<script lang="ts">
	import { auth, firestore, userData } from "$lib/firebase";
	import { userStore } from "sveltefire";
	import {
		GoogleAuthProvider,
		signInWithPopup,
		type UserCredential,
		signOut,
	} from "firebase/auth";
	import { SignedIn, SignedOut } from "sveltefire";
	import { Modal } from "$lib/modal/modal";
	import { onMount } from "svelte";
	import { doc, getDoc, writeBatch } from "firebase/firestore";
	import { error } from "@sveltejs/kit";
	import blank_profile from "$lib/assets/Blank_Profile.webp";
	import logo_picture from "$lib/assets/logo.png";
	import { Menu } from "lucide-svelte";
	import { page } from "$app/stores";

	$: useSidebar = $page.url.pathname == "/";

	let loginModal: Modal;
	let ready = false;
	let email = "";
	let password = "";
	let username = "";
	let user = userStore(auth);

	onMount(() => {
		ready = true;
		// themeChange(false);
		loginModal = new Modal("login");
	});
	let loading = false;
	let isAvailable = false;

	async function signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then(verifyUserToken)
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
			});
	}

	async function verifyUserToken(userCredential: UserCredential) {
		const idToken = await userCredential.user.getIdToken();
		loginModal.closeModal();
		confirmUsername(userCredential.user.displayName || username);
		const res = await fetch("/api/signin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// 'CSRF-Token': csrfToken  // HANDLED by sveltekit automatically
			},
			body: JSON.stringify({ idToken }),
		});
		window.sessionStorage.clear();
	}

	async function signOutSSR() {
		const res = await fetch("/api/signin", { method: "DELETE" });
		window.sessionStorage.clear();
		await signOut(auth);
	}

	async function confirmUsername(customUsername: string | null) {
		const userSnapshot = await getDoc(doc(firestore, "users", $user!.uid));
		if (userSnapshot.exists()) {
			return;
		}
		if ($user && customUsername && customUsername !== "") {
			customUsername = customUsername
				.replace(/ /g, "_")
				.replace(/[^\w\s.-]/g, "")
				.toLowerCase();
			const batch = writeBatch(firestore);
			batch.set(doc(firestore, "usernames", customUsername), {
				uid: $user?.uid,
			});
			batch.set(doc(firestore, "users", $user!.uid), {
				username: customUsername,
				photoURL: $user?.photoURL ?? null,
				published: true,
				bio: "",
			});

			await batch.commit();

			username = "";
			email = "";
			password = "";
			isAvailable = false;
		} else {
			error(405, "No username was given.");
		}
	}
</script>

<!-- {@debug useSidebar} -->
<!-- You can open the modal using ID.showModal() method -->
<!-- <dialog id="login" class="modal custom-font transition-[height]">
	<div
		class="modal-box flex flex-col h-fit justify-center text-center items-center"
	>
		<form method="dialog">
			<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>✕</button
			>
		</form>
		<div class="max-w-xs w-full">
			<button class="btn btn-outline" on:click={signInWithGoogle}>
				<img
					width="16"
					alt="Google &quot;G&quot; logo"
					src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/16px-Google_%22G%22_logo.svg.png"
				/>
				Google
			</button>
		</div>
	</div>
</dialog> -->

<div class="flex flex-col h-svh">
	<div class="navbar bg-base-200">
		<div class="flex-1">
			{#if useSidebar}
				<a class="btn-ghost text-xl lg:btn hidden" href="/"
					><img
						src={logo_picture}
						alt="Company logo"
						class="w-40 bg-center object-center"
					/></a
				>
				<label
					for="my-drawer-2"
					class="btn drawer-button lg:hidden btn-outline btn-square"
					><Menu /></label
				>
			{:else}
				<a class="btn-ghost text-xl btn" href="/"
					><img
						src={logo_picture}
						alt="Company logo"
						class="w-40 bg-center object-center"
					/></a
				>
			{/if}
		</div>
		<div class="flex-none gap-2">
			<!-- <div class="flex">
				<a href="/link1"><button class="btn btn-ghost">Link 1</button></a>
        <a href="/link2"><button class="btn btn-ghost">Link 2</button></a>
        <a href="/link3"><button class="btn btn-ghost">Link 3</button></a>
			</div> -->

			<SignedOut>
				<button class="btn btn-outline" on:click={signInWithGoogle}>
					<img
						width="16"
						alt="Google &quot;G&quot; logo"
						src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/16px-Google_%22G%22_logo.svg.png"
					/>
					Google
				</button>
			</SignedOut>

			<SignedIn let:user>
				<div class="dropdown dropdown-end">
					<div
						tabindex="0"
						role="button"
						class="btn btn-ghost btn-circle avatar"
					>
						<div class="w-10 rounded-full">
							<img
								alt="Tailwind CSS Navbar component"
								src={user.photoURL || blank_profile}
							/>
						</div>
					</div>
					<ul
						tabindex="-1"
						class="mt-3 z-[1] p-2 shadow menu dropdown-content bg-base-200 rounded-box w-52"
					>
						<li>
							<p>@{$userData?.username}</p>
						</li>
						<li><button on:click={signOutSSR}>Logout</button></li>
					</ul>
				</div>
			</SignedIn>
		</div>
	</div>
	<div class="flex-grow ">
		<slot />
	</div>
	
</div>
