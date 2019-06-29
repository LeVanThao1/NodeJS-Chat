const API_URL = 'http://localhost:3000';

$('#btn-login').click(function () {
	login($('#input-username').val().trim(), $('#input-password').val().trim())
});

async function login(username, password) {
	try {
		const loginResponse = await axios({
			method: 'post',
			url: `${API_URL}/api/v1/login`,
			data: {
				username,
				password
			}
		});
		if (loginResponse.status === 200) {
			console.log(loginResponse);
			// debugger;
			const token = loginResponse.data.data.access_token;
			const userId = loginResponse.data.data.userId;
			const username = loginResponse.data.data.username;
			localStorage.setItem('token', token);
			localStorage.setItem('userId', userId);
			localStorage.setItem('username', username);
			return redirect('chat-homepage.html');
		}
		return alert("Login not successfully");
	} catch (e) {
		alert(e.response);
	}
}