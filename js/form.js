export function initForm(form) {
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}
