import { Router } from "express"
import userModel from "../models/schemas/Users.model.js"
import passport from "passport"
import { generateToken } from "../utils/token.js"
import { createHash } from "../utils/password.js"
import passportControl from "../middlewares/passport-control.middleware.js"
import auth from "../middlewares/auth.middlewares.js"
import { HTTP_STATUS, successResponse } from "../utils/responses.js"
import EError from "../errors/num.js"
import customError from "../errors/customError.js"
import { missingDataError } from "../errors/info.js"

const authMid = [
    passportControl("jwt"),
    auth("user")
]

const router = Router()

router.post("/register", passport.authenticate("register", {passReqToCallback: true, session: false, failureRedirect: "/api/session/failedRegister", failureMessage: true}), (req, res) => {
    res.status(HTTP_STATUS.OK).send({status: "success", message: "Usuario registrado", payload: req.user._id})
})

router.post("/login", passport.authenticate("login", {passReqToCallback: true, session: false, failureRedirect: "/api/session/failedLogin", failureMessage: true}), (req, res) => {
    const user = req.user
    const access_token = generateToken(user)

    res.cookie("CoderCookie", access_token, {
        maxAge: 60*60*1000,
        httpOnly: true
    })
    res.status(HTTP_STATUS.OK).send({status:"success", payload: user})
})

router.get("/failedRegister", (req, res) => {
    res.status(HTTP_STATUS.SERVER_ERROR).send({message: "Failed register"})
})

router.get("/failedLogin", (req, res) => {
    res.status(HTTP_STATUS.SERVER_ERROR).send({message: "Failed login"})
})

router.post("/resetPassword", async (req, res) => {
    const {email, password} = req.body
    if(!email){
        customError.createError({
            name: "Error al resetear la contraseña",
            cause: missingDataError("Usuario"),
            message: "La informacion del usuario esta incompleta",
            code: EError.INVALID_TYPES_ERROR
        })
    }

    if(!password){
        customError.createError({
            name: "Error al resetear la contraseña",
            cause: missingDataError("Contraseña"),
            message: "La informacion de la contraseña esta incompleta",
            code: EError.INVALID_TYPES_ERROR
        })
    }

    const user = await userModel.findOne({email})
    if(!user){
        customError.createError({
            name: "Error al resetear la contraseña",
            cause: "Usuario no encontrado",
            message: "Usuario inexistente",
            code: EError.NOT_FOUND
        })
    }
    user.password = createHash(password)

    const result = await userModel.updateOne({email:email}, user)
    const response = successResponse(result)
    res.status(HTTP_STATUS.OK).send(response)
})


router.get("/github", passport.authenticate("github", {scope: ["user: email"]})),async (req, res) => {
    res.status(HTTP_STATUS.OK).send("Usuario logueado con GitHub")
}

router.get("/githubCallback", passport.authenticate("github", {failureRedirect: "/login"})),async (req, res) => {
    req.session.user = req.user
    res.redirect("/products")
}


router.post("/logout", (req, res, next) => {        
        try {
            if(req.session){
                req.session.destroy(err => {
                    if(err){
                        return next(err)
                    }
                })
            }
            res.clearCookie("CoderCookie")
            res.status(HTTP_STATUS.OK).send("Logout")
        } catch (error) {
            next(error)
        }
    
})


router.get("/current", authMid, async (req, res) => {
    const user = req.user
    res.send(user)
    //res.render("current", {user})
})

export default router