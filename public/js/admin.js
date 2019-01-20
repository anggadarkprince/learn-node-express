const btnDelete = document.querySelectorAll('.btn-delete');
btnDelete.forEach((button) => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure want to delete?')) {
            const formAction = this.parentElement.getAttribute('action');
            const csrfToken = this.parentElement.querySelector('[name=_csrf]').value;

            const options = {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'csrf-token': csrfToken
                }
            }
            fetch(formAction, options)
                .then(result => result.json())
                .then(result => {
                    this.closest('.product-item').remove();
                    console.log(result);
                })
                .catch(console.log);
        }
    });
});