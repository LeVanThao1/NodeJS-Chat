// $('.chat-box').hide();
// $('box').hide();
const token = localStorage.getItem('token');
console.log(token);
const socket = io('http://localhost:3000?token=' + token);

$(document).ready(function () {
    socket.on('error', function (err) {
        console.error(err);
    });
    socket.on('messages', function (data) {
        switch (data.action) {
            case 'RECEIVE': {
                // console.log(data.message);
                const groupId = localStorage.getItem('groupId');
                const userId = localStorage.getItem('userId');
                if (data.message.group.toString() === groupId) {
                    if (userId !== data.userId) {
                        $('.list').append('<div class="message"><p>' + data.message.content + '</p></div>');
                        // $(`.group id-group=${groupId}`).set(``);
                    } else {
                        $('.list').append('<div class="message me"><p>' + data.message.content + '</p></div>');
                        // $(`.group id-group=${groupId}`).set(``);
                    }
                }
                return;
            }
            case 'RECEIVE_TYPING': {
                console.log('typing');
                $('#typing').remove();
                const groupId = localStorage.getItem('groupId');
                console.log(groupId, data.message);
                if (data.group.toString() === groupId) {
                    $('.list').append(`
                    <div id="typing" class="message">
                        <p>...</p>
                    </div>
                `);
                    // scrollToBottom();
                }
                return;
            }
            case 'RECEIVE_DONE_TYPING': {
                // console.log('done-typing');
                console.log('done-typing');
                const groupId = localStorage.getItem('groupId');
                if (data.group.toString() === groupId) {
                    $('#typing').remove();
                }
                return;
            }
            default:
                return;
        }
    });
    socket.on('status', function (data) {
        switch (data.action) {
            case 'ONLINE': {
                // const groupId = localStorage.getItem('groupId');
                const listGroup = JSON.parse(localStorage.getItem('listGroup'));
                console.log(listGroup);
                let statusUser = '';
                for (const group of listGroup) {
                    const memberOnline = group.members.find(member => member._id.toString() === data.data);
                    if (!!memberOnline) {
                        memberOnline.isOnline = true;
                        console.log(memberOnline.isOnline);
                        // $(`.${groupId}`).html('Online');
                        if (group.members.length === 1) {
                            statusUser = 'Online'
                        } else if (group.members.length === 2) {
                            statusUser = group.members.every(members => members.isOnline) ? 'Online' : 'Offline';
                        } else {
                            statusUser = group.members.some(members => members.isOnline) ? 'Online' : 'Offline';
                        }
                        console.log(statusUser);
                        // console.log($(`${groupId}`).val());
                        $(`.status-${group._id}`).html(statusUser);
                    }
                }
                break;
            }
            case 'OFFLINE': {
                // const groupId = localStorage.getItem('groupId');
                const listGroup = JSON.parse(localStorage.getItem('listGroup'));
                let statusUser = '';
                for (const group of listGroup) {
                    const memberOnline = group.members.find(member => member._id.toString() === data.data);
                    if (!!memberOnline) {
                        memberOnline.isOnline = false;
                        console.log(memberOnline.isOnline);
                        // $(`.${groupId}`).html('Online');
                        if (group.members.length === 1) {
                            statusUser = 'Offline'
                        } else if (group.members.length === 2) {
                            statusUser = group.members.every(members => members.isOnline) ? 'Online' : 'Offline';
                        } else {
                            statusUser = group.members.some(members => members.isOnline) ? 'Online' : 'Offline';
                        }
                        console.log(statusUser);
                        // console.log($(`${groupId}`).val());
                        $(`.status-${group._id}`).html(statusUser);
                    }
                }
                // if (!!memberOnline) {
                //     memberOnline.isOnline = false;
                //     console.log(memberOnline.isOnline);
                //     // $(`.${groupId}`).html('Ofline');
                //     // $(`.listGroup .${groupId} .info .${groupId}`).html('ofline');
                // }
                // break;
            }
        }
    });
    let doneTypingTimer;
    let typingTimer;
    $('#input-message').on('input', function (event) {
        const groupId = localStorage.getItem('groupId');
        if (!typingTimer) {
            socket.emit('messages', {
                groupId,
                action: 'SEND_TYPING'
            }, function (err, callback) {
                if (err) {
                    alert('Oops, something went wrong!');
                    return;
                }
                console.log('send typing');
            });
        }
        clearTimeout(typingTimer);
        clearTimeout(doneTypingTimer);

        typingTimer = setTimeout(function () {
            socket.emit('messages', {
                groupId,
                action: 'SEND_TYPING'
            }, function (err, callback) {
                if (err) {
                    alert('Oops, something went wrong!');
                    return;
                }
            });
        }, 800);
    });

    $('#input-message').on('keyup', function (event) {
        clearTimeout(doneTypingTimer);
        const groupId = localStorage.getItem('groupId');
        doneTypingTimer = setTimeout(function () {
            socket.emit('messages', {
                groupId,
                action: 'SEND_DONE_TYPING'
            }, function (err, callback) {
                if (err) {
                    alert('Oops, something went wrong!');
                    return;
                }
                typingTimer = null;
                console.log('send done')
            });
        }, 800);
    });

    $('form').on('submit', function (event) {
        event.preventDefault();
        const msg = $('#input-message').val().trim();
        const groupId = localStorage.getItem('groupId');
        if (msg === '' || !groupId) {
            return;
        }
        socket.emit('messages', {
            action: 'SEND',
            message: msg,
            groupId: groupId
        }, function (error, data) {
            console.log(data);
            if (error) {
                alert('Oops, something when wrong!');
                return;
            }

            $('.list').append(`
            <div class="message me">
                <p>${data.content}</p>
                <span class='time'>${new Date(data.createdAt).toLocaleString()}</span>
            </div>
        `);
            // scrollToBottom();

            clearTimeout(typingTimer);
            clearTimeout(doneTypingTimer);
            socket.emit('messages', {
                groupId,
                action: 'SEND_DONE_TYPING'
            }, function (err, callback) {
                if (err) {
                    alert('Oops, something went wrong!');
                    return;
                }
                typingTimer = null;
                console.log('send done')
            });
        });
        $('#input-message').val('');
    });
});
// socket.on('messages', function (data) {
//     $('.list').append(`<div class="message"> ${data} </div>`);
// // });
// $('#group1').click(function() {
//     socket.emit('messages', { action: 'GET' }, function(err, callback) {
//         if (err) {
//             console.log(err);
//           return alert('Oops, something went wrong!');
//         }
//       });
//       $('.chat-box').show();
//       $('box').show();
// });
// $('#btn-send').click(function () {
//     const message = $('#send').val().trim();
//     if (message) {
//         socket.emit('messages',{ action: 'SEND', message }, function (err, response) {
//             if (err) {
//                 return alert(err);
//             }
//             $('.list').append(`<div class="message me"><p> ${message} </p></div>`);
//             $('#send').val('');
//         });
//     }
// });
// $('#send').on('keyup', function(e) {
//     const message = $('#send').val().trim();

//     const groupId = $('.infomessage').attr('id-group-now');

//     const keycode = (event.keyCode ? event.keyCode : event.which);
//     if (keycode === 13) { 
//         // console.log(message);
//         // console.log(groupId);
//       socket.emit('messages', { action: 'SEND', message, groupId }, function(err, callback) {
//         if (err) {
//           alert('Oops, something went wrong!');
//           return;
//         }
//       });
//       $('.list').append(`<div class="message me"><p> ${message} </p></div>`);
//       $('#send').val('');
//     }
//   });
