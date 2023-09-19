import express from "express"
import mongoose from "mongoose"
import handlebars from "express-handlebars"
import { Server } from "socket.io"
import passport from "passport"
import cookieParser from "cookie-parser"

import __dirname from "./dirname.js"
import viewRouter from "./routes/views.router.js"
import appRouter from "./routes/app.router.js"
import initializePassport from "./config/passport.config.js"
import CONFIG from "./config/config.js"
import errorMiddle from "./middlewares/indexControlError.js"


const app = express()

mongoose.set("strictQuery", false)

const {PORT, MONGO_URL} = CONFIG

const connection = mongoose.connect(MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "ecommerce"
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))


app.engine("handlebars", handlebars.engine())
app.set("views", __dirname + "/views")
app.set("view engine", "handlebars")


app.use(cookieParser())
app.use(errorMiddle)

app.use("/api", appRouter)
app.use("/", viewRouter)

initializePassport(passport)
app.use(passport.initialize())
app.use(passport.session({
    // store: MongoStore.create({
    //     mongoUrl: "mongodb+srv://bonfilnico:12345@pruebacoder.q69nl8a.mongodb.net/?retryWrites=true&w=majority",
    //     mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true},
    //     ttl:3600
    // }),
    secret: "12345abcd",
    resave: false,
    saveUninitialized: true
}))


// app.use(session({
//     secret: "SecretCoders"
// }))

const httpserver = app.listen(PORT, () => console.log("Server arriba"))
const socketServer = new Server(httpserver)

socketServer.on("connection", socket => {
    console.log("Nuevo cliente");
})

export default socketServer