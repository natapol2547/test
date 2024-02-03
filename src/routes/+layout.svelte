<script lang="ts">
	import "../app.css";
	import { auth, firestore, storage, userData } from "$lib/firebase";
	import { FirebaseApp, userStore } from "sveltefire";
	import { GoogleAuthProvider, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, type UserCredential, signOut } from "firebase/auth";
	import { SignedIn, SignedOut } from "sveltefire";
	import { Modal } from "$lib/modal/modal";
	import { onMount } from "svelte";
	import { doc, getDoc, writeBatch } from "firebase/firestore";
	import { error } from "@sveltejs/kit";
	import Tabs from "$lib/tabs/tabs.svelte";
	import { slide } from "svelte/transition";
	import blank_profile from "$lib/assets/Blank_Profile.webp"

  let loginModal: Modal;
  let ready = false;
	let email = "";
	let password = "";
	let username = "";
	let errorMessage = "";
	let user = userStore(auth);

	onMount(() => {
		ready = true;
		// themeChange(false);
		loginModal = new Modal("login");
	});
	let loading = false;
	let isAvailable = false;
	let debounceTimer: NodeJS.Timeout;

	async function checkAvailability() {
		if (isValidUsername && isTouchedUsername) {
			isAvailable = false;
			clearTimeout(debounceTimer);

			loading = true;

			debounceTimer = setTimeout(async () => {
				const ref = doc(firestore, "usernames", username);
				const exists = await getDoc(ref).then((doc) => doc.exists());

				isAvailable = !exists;
				loading = false;
			}, 500);
		}
	}

	async function signUpWithPassword() {
		createUserWithEmailAndPassword(auth, email, password)
			.then(verifyUserToken)
			.catch((error) => {
				const errorCode = error.code;
				if (error.message == "Firebase: Error (auth/email-already-in-use).") {
					errorMessage = "มีผู้ใช้นี้อยู่แล้ว โปรด Login";
				}

				// ..
			});
	}

	async function signInWithPassword() {
		signInWithEmailAndPassword(auth, email, password)
			.then(verifyUserToken)
			.catch((error) => {
				const errorCode = error.code;
				if (
					error.message ==
						"Firebase: Error (auth/invalid-login-credentials)." ||
					error.message ==
						"Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests)."
				) {
					errorMessage = "Email หรือ Password ผิด";
				}
			});
	}
	async function signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then(verifyUserToken)
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
			});
	}

	async function resetPassword() {
		sendPasswordResetEmail(auth, email)
			.then(() => {
				// Password reset email sent!
				// ..
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				// ..
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

	const re_email =
		/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
	const re_pass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
	const re_username = /^(?=[a-z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

	$: isValidUsername = re_username.test(username);
	$: isValidPassword = re_pass.test(password);
	$: isValidEmail = re_email.test(email);
	$: isTouchedUsername = username.length > 0;
	$: isTaken = isValidUsername && !isAvailable && !loading;
</script>

<!-- You can open the modal using ID.showModal() method -->
<dialog id="login" class="modal custom-font transition-[height]">
	<div
		class="modal-box flex flex-col h-fit justify-center text-center items-center"
	>
		<form method="dialog">
			<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>✕</button
			>
		</form>
		<Tabs tabs={["Login", "Sign Up"]} let:activeTab>
			<div class:hidden={activeTab != 0} class="my-4 w-full max-w-xs">
				<form
					class="mx-auto w-full text-center items-center"
					on:submit|preventDefault={signInWithPassword}
				>
					<div class="label">
						<span class="label-text">Email</span>
					</div>
					<input
						type="email"
						id="email-login"
						name="email"
						bind:value={email}
						required
						class="input input-bordered w-full"
					/>
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<input
						type="password"
						id="password-login"
						name="password-login"
						bind:value={password}
						class="input input-bordered w-full"
						required
					/>

					<button
						type="submit"
						class="btn btn-neutral btn-outline w-full mt-4">Login</button
					>

					<!-- <button class="btn" on:click={signInWithGoogle}>Google</button> -->
				</form>
			</div>
			<div class:hidden={activeTab != 1} class="my-4 w-full max-w-xs">
				<form
					class="mx-auto w-full text-center items-center"
					on:submit|preventDefault={signUpWithPassword}
					autocomplete="off"
				>
					<div class="label">
						<span class="label-text">Username</span>
					</div>
					<div
						class="tooltip tooltip-bottom w-full"
						data-tip="3-15 ตัวอักษร / a-z / 0-9"
					>
						<input
							type="text"
							id="username-signup"
							name="username-signup"
							bind:value={username}
							required
							class:input-error={!isValidUsername && isTouchedUsername}
							class:input-warning={isTaken}
							class:input-success={isAvailable && isValidUsername && !loading}
							class="input input-bordered w-full"
							on:input={checkAvailability}
						/>
						<div class="max-w-xs">
							<!-- {#if !isValid && isTouchedUsername}
							<p class="text-error text-sm">
								must be 3-16 characters long, alphanumeric only
							</p>
						{/if}
				
						{#if isValid && !isAvailable && !loading}
							<p class="text-warning text-sm">
								@{username} is not available
							</p>
						{/if} -->
						</div>
					</div>

					<div class="label">
						<span class="label-text">Email</span>
					</div>
					<input
						type="email"
						id="email-signup"
						name="email"
						bind:value={email}
						class:input-warning={!isValidEmail && email.length != 0}
						required
						class="input input-bordered w-full"
					/>
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<div
						class="tooltip tooltip-bottom w-full"
						data-tip="อย่างน้อย 8 ตัวอักษร / ตัองมีตัวเลข / a-z / A-Z / 0-9"
					>
						<input
							type="password"
							id="password-signup"
							name="password-signup"
							bind:value={password}
							class:input-warning={!isValidPassword && password.length != 0}
							class="input input-bordered w-full"
							required
						/>
					</div>

					<button
						type="submit"
						class="btn btn-neutral btn-outline w-full mt-4"
						disabled={!isAvailable ||
							email.length == 0 ||
							password.length == 0 ||
							!isValidPassword ||
							!isValidUsername}>Sign Up @{username}</button
					>

					<!-- <button class="btn" on:click={signInWithGoogle}>Google</button> -->
				</form>
			</div>
		</Tabs>
		{#if errorMessage}
			<p class="text-error font-bold" transition:slide>{errorMessage}</p>
			{#if errorMessage == "Email หรือ Password ผิด"}
				<button class="underline" on:click={resetPassword}
					>ต้องการรีเซ็ตรหัสผ่าน?</button
				>
			{/if}
		{/if}
		<div class="max-w-xs w-full">
			<div class="divider">หรือ</div>
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
</dialog>

<FirebaseApp {auth} {firestore} {storage}>
	<div class="navbar bg-base-100">
		<div class="flex-1">
			<a class="btn btn-ghost text-xl" href="/">ตึงเกินต้าน.com</a>
		</div>
		<div class="flex-none gap-2">
			<div class="flex">
				<a href="/link1"><button class="btn btn-ghost">Link 1</button></a>
        <a href="/link2"><button class="btn btn-ghost">Link 2</button></a>
        <a href="/link3"><button class="btn btn-ghost">Link 3</button></a>
			</div>
			<SignedOut>
				<button class="btn" on:click={() => {loginModal.openModal()}}>Login</button>
			</SignedOut>

			<SignedIn let:user>
				<div class="dropdown dropdown-end">
					<div
						tabindex="0"
						role="button"
						class="btn btn-ghost btn-circle avatar"
					>
						<div class="w-10 rounded-full">
							<img alt="Tailwind CSS Navbar component" src={user.photoURL || blank_profile} />
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

	<slot />
</FirebaseApp>
