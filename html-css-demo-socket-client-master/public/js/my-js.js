const HOST = 'http://localhost:3000';
$('#error').hide();
$('#btn-sign-up').click(function () {
    $('#error').hide();
    // login($('#input-username').val().trim(), $('#input-password').val().trim());
    const username = $('#username').val().trim();
    console.log(username);
    const password = $('#password').val().trim();
    console.log(password);
    const rePassword = $('#re-password').val().trim();
    console.log(rePassword);
    if (password === rePassword) {
        signup(username, password);
    }
    else
       $('#error').show();
});
async function signup(username, password) {
    try {
        const signupResponse = await axios({
			method: 'post',
			url: `${HOST}/api/v1/users`,
			data: {
				username,
				password
			}
        });
        console.log(signupResponse);
        if (signupResponse.status !== 200) {
            alert('sign up not successfully');
        }
        alert('sign up successfully');
    } catch (e) {
        alert(e.response);
    }
}
$()