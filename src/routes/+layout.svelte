<script lang="ts">
	import "../app.css";
	import { auth, firestore, storage } from "$lib/firebase";
	import { FirebaseApp } from "sveltefire";
	import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
	import { SignedIn, SignedOut } from "sveltefire";
	import { Modal } from "$lib/modal/modal";
	import { onMount } from "svelte";

  let loginModal: Modal;
  onMount(()=>{
    loginModal = new Modal("login");
  })
  const provider = new GoogleAuthProvider();
  async function signInWithGoogle() {
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential?.accessToken;
				// The signed-in user info.
				const user = result.user;
        loginModal.closeModal()
				// IdP data available using getAdditionalUserInfo(result)
				// ...
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.customData.email;
				// The AuthCredential type that was used.
				const credential = GoogleAuthProvider.credentialFromError(error);
				// ...
			});
	}
</script>

<!-- You can open the modal using ID.showModal() method -->
<dialog id="login" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <div class="flex flex-col w-full justify-center text-center items-center">
      <button class="btn" on:click={signInWithGoogle}>Google</button>
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

			<SignedIn let:signOut let:user>
				<div class="dropdown dropdown-end">
					<div
						tabindex="0"
						role="button"
						class="btn btn-ghost btn-circle avatar"
					>
						<div class="w-10 rounded-full">
							<img alt="Tailwind CSS Navbar component" src={user.photoURL} />
						</div>
					</div>
					<ul
						tabindex="-1"
						class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52"
					>
						<li>
							<p>{user.displayName}</p>
						</li>
						<li><button on:click={signOut}>Logout</button></li>
					</ul>
				</div>
			</SignedIn>
		</div>
	</div>

	<slot />
</FirebaseApp>
