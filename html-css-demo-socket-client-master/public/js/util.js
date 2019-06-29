const LOCAL_DOMAIN = 'http://localhost:3001';

function redirect(path) {
    if (!path) {
        return;
    }
    return window.location = `${LOCAL_DOMAIN}/${path}`;
}