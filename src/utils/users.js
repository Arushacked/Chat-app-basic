users = []

const addUser = ({id, username, room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: "Room and user are required!"
        }
    }

    existingUser = users.find((user) => user.username===username && user.room === room)

    if(existingUser){
        return {
            error: `${username} is already in use!`
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=> user.id===id)
    if(index !== -1){
        const user = users.splice(index, 1)
        return user[0]
    } 
}
const getUser = (id) =>{
    return users.find((user)=> user.id===id)
    
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room===room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


