import * as common from "./common.js"
import { LoginDTO, RegisterDTO } from "./entity.js"

// Render Login Page
export function renderLogin() {
    common.clearPage()
    common.removeToken()
    document.body.appendChild(common.template("login-template"))
    document.getElementById("sign-up").addEventListener("click", () => { window.location.hash = "#register" })
    common.active("nav-login")

    // Every time the login page is rendered, register all the listeners
    // Check validity after inputting
    const email = document.getElementById("email")
    email.addEventListener("blur", () => { checkEmail(email, true) })
    const password = document.getElementById("password")
    password.addEventListener("blur", () => { checkNotNull(password, true) })
    document.getElementById("form").addEventListener("submit", function(event) { 
        event.preventDefault()
        login(email, password)
    })
}

// Render Register Page
export function renderRegister() {
    common.clearPage()
    document.body.appendChild(common.template("register-template"))
    document.getElementById("sign-in").addEventListener("click", () => { window.location.hash = "#login" })
    common.active("nav-register")

    // Every time the register page is rendered, register all the listeners
    // Check validity after inputting
    const email = document.getElementById("email")
    email.addEventListener("blur", () => { checkEmail(email) })
    const name = document.getElementById("name")
    name.addEventListener("blur", () => { checkNotNull(name) })
    const password = document.getElementById("password")
    password.addEventListener("blur", () => { checkNotNull(password) })
    const confirmPassword = document.getElementById("confirm-password")
    confirmPassword.addEventListener("blur", () => { checkConfirmPassword(password, confirmPassword) })
    document.getElementById("form").addEventListener("submit", function(event) { 
        event.preventDefault()
        register(email, name, password, confirmPassword)
    })
}

export function checkEmail(input, mode=false) {
    if (input.value === "" || !common.validEmail(input.value)) {
        common.invalid(input)
        return false
    } else {
        mode ? input.classList.remove("is-invalid") : common.valid(input)
        return true
    }
}

export function checkNotNull(input, mode=false) {
    if (input.value === "") {
        common.invalid(input)
        return false
    } else {
        mode ? input.classList.remove("is-invalid") : common.valid(input)
        return true
    }
}

function checkConfirmPassword(password, confirmPassword) {
    if (password.value != confirmPassword.value) {
        common.invalid(confirmPassword)
        return false
    } else {
        common.valid(confirmPassword)
        return true
    }
}

function login(email, password) {
    if (!checkEmail(email, true)) {
        common.displayAlert("Please input a valid email address")
        return
    }
    if (!checkNotNull(password, true)) {
        common.displayAlert("Please input your password")
        return
    }

    // Request the Login API
    fetch(common.URL + "/auth/login", {
        method: "POST",
        body: JSON.stringify(new LoginDTO(email.value, password.value)),
        headers: common.header(false)
    }).then(res => res.json()).then(res => {
        if (res.token == null) {
            throw new Error(res.error)
        }
        common.saveToken(res.token, res.userId)
        window.location.hash = ""
    }).catch(error => {
        error.message == "Failed to fetch" ? common.displayAlert("You can't sign in now due to a network error") : common.displayAlert(error.message)
    })
}

function register(email, name, password, confirmPassword) {
    if (!checkEmail(email)) {
        common.displayAlert("Please input a valid email address")
        return
    }
    if (!checkNotNull(name)) {
        common.displayAlert("Please input a name")
        return
    }
    if (!checkNotNull(password)) {
        common.displayAlert("Please input a password")
        return
    }
    if (!checkConfirmPassword(password, confirmPassword)) {
        common.displayAlert("Two passwords are not match")
        return
    }

    // Request the Register API
    fetch(common.URL + "/auth/register", {
        method: "POST",
        body: JSON.stringify(new RegisterDTO(email.value, name.value, password.value)),
        headers: common.header(false)
    }).then(res => res.json()).then(res => {
        if (res.token == null) {
            throw new Error(res.error)
        }
        common.saveToken(res.token, res.userId)
        window.location.hash = ""
    }).catch(error => error.message == "Failed to fetch" ? common.displayAlert("You can't sign up now due to a network error") : common.displayAlert(error.message))
}