const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage} = require("./utils/messages")
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require("./utils/users")

const server = http.createServer(app)
const io = socketio(server)


const PORT = process.env.PORT || 3000
publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket)=>{
    // console.log("New Websocket connection established")
    

    socket.on("join", ({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit("message", generateMessage("Admin", "Welcome!")) 
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has connected!`))
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on("sendMessage", (message, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }
        const user = getUser(socket.id)
        io.to(user.room).emit("message", generateMessage(user.username, message))
        callback()
    })

    socket.on("sendLocation", (location, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateMessage(user.username, `https://google.com/maps?q=${location.lat},${location.lon}`))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(PORT, ()=>{
    console.log(`App is up and running at ${PORT}`)
})