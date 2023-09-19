import { Router } from "express"
import productsRouter from "./products.router.js"
import cartsRouter from "./carts.router.js"
import messagesRouter from "./messages.router.js"
import sessionRouter from "./sessions.router.js"

const router = Router()

router.use("/products", productsRouter.getRouter())
router.use("/carts", cartsRouter.getRouter())
router.use("/messages", messagesRouter.getRouter())
router.use("/session", sessionRouter)

export default router