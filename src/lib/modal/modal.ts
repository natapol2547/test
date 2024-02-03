export class Modal {
  modal:HTMLElement|null
  constructor(name:string) {
    this.modal = document.getElementById(name);
  }
  openModal(){
    if (this.modal) {
      (this.modal as any).showModal();
    }
  }
  closeModal(){
    if (this.modal) {
      (this.modal as any).close();
    }
  }
}
