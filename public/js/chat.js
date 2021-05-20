const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")
const $sidebar = document.querySelector("#sidebar")


//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {

    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of messages container
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages cotainer
    const containerHeight = $messages.scrollHeight

    // How far ave I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("locationMessage", (message)=>{
    // console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("message", (message)=>{
    // console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt : moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

$messageForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute("disabled", "disabled")

    const message = e.target.elements.message.value

    socket.emit("sendMessage", message, (error)=>{
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        // console.log("Message Delivered! ")
    })
})

$sendLocationButton.addEventListener("click", ()=>{
    $sendLocationButton.setAttribute("disabled", "disabled")

    if(!navigator.geolocation){
        alert("Your browser does not support Geo-location")
    }
    navigator.geolocation.getCurrentPosition((location)=>{
        const lat = location.coords.latitude
        const lon = location.coords.longitude
        socket.emit("sendLocation",{lat, lon}, (error)=>{
            $sendLocationButton.removeAttribute("disabled")
            if(error){
                return console.log("Location not shared: ", error)
            }

            // console.log("Location shared!")
        })
    })
})

socket.on("roomData", ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {room, users})
    $sidebar.innerHTML = html
})


socket.emit("join", {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
