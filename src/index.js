const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const socketio = require("socket.io")

const server = http.createServer(app)
const io = socketio(server)


const PORT = process.env.PORT || 3000
publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket)=>{
    console.log("New Websocket connection established")
    socket.emit("message", "Welcome!") 

    socket.on("sendMessage", (message)=>{
        io.emit("message", message)
    })

})



server.listen(PORT, ()=>{
    console.log(`App is up and running at ${PORT}`)
})