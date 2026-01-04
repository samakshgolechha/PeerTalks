export function getUserDetails (){
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    return {username, password}
}