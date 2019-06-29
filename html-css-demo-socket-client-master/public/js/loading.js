$('.chat-box').hide();
$(document).ready(function(){
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    // console.log(token);
    // console.log(userId);
    if (!token || !username || !userId) {
        window.location.href = '/';
    }
    loadPage(username).then(res =>{
        loadGroup(token).then(res => {
            // $('.chat-box').html('');
           
        });
    }).catch(err => {
        console.error(err);
        window.location.href = '/';
    });
    $(document).on('click', '.group', async function(event){
        // $('.chat-box').html('');
        const groupId = $(this).attr('id-group');
        localStorage.setItem('groupId', groupId);
        const groupName = $(this).attr('group-name');
        await loadMessages(groupName ,userId, groupId, token);
        $('.chat-box').show();
    });
});

async function loadPage(username) {
    $(document).ready(function () {
        $('.headerPage').append(`<img src="./images/user.png" />
                            <h3>${username}</h3>`);
    });
} 
async function loadGroup(token) {
    const dataGroups = await axios.get(`http://localhost:3000/api/v1/groups?token=${token}`, { headers: { token }});
    console.log(dataGroups);
    let statusUser = '';
    localStorage.setItem('listGroup', JSON.stringify(dataGroups.data.data));
    console.log(dataGroups.data.data);
    for(const group of dataGroups.data.data) {
        console.log(group);    
        if (group.members.length === 1) {
            statusUser = 'Online'
        } else if (group.members.length === 2) {
            statusUser = group.members.every(members => members.isOnline) ? 'Online' : 'Offline';
        } else {
            statusUser = group.members.some(members => members.isOnline) ? 'Online' : 'Offline';
        }
        // debugger
        $('.listGroup').append(`<div class="group" id-group=${group._id} group-name=${group.name}>
                                <img src="./images/user.png" />
                                <div class="info">
                                    <p>${group.name} <span class=status-${group._id}>${statusUser}</span></p>
                                    <span>${group.lastMessage.content}</span>
                                    <span class="time">${group.lastMessage.createdAt}</span>
                                </div>
                            </div>`)
    }
}
async function loadMessages(groupName, userId, groupId, token) {
    // console.log(123);
    $('.header').html(`<div class = "infomessage" id-group-now = ${groupId}>
                            <img src = "./images/user.png" />
                            <p>${groupName}</p>
                        </div>` );
    const dataMessages = await axios.get(`http://localhost:3000/api/v1/messages/groups/${groupId}?token=${token}`, { headers: { token }} );
        // console.log(dataMessages);
        $('.list').html('');
        debugger
        for(const message of dataMessages.data.data){
            // console.log(message.author._id);
        if (message.author._id === userId) {
            $('.list').append( `<div class="message me">
                                    <p>${message.content}</p>
                                    <span>${message.createdAt}</span>
                                </div>`)
        } else {
            $('.list').append( `<div class="message">
                                    <p>${message.content}</p>
                                    <span>${message.createdAt}</span>
                                </div>`)
        }
    }
}
