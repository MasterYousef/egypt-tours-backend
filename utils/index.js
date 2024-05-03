const tourRoute = require("../routes/tourRoute")
const userRoute = require("../routes/userRoute")
const authRoute = require("../routes/authRoute")
const ratingRoute = require("../routes/ratingRoute")
const couponRoute = require("../routes/couponRoute")
const orderRoute = require("../routes/orderRoute")

const routes = (app)=>{
    app.use("/api/v1/tour",tourRoute)
    app.use("/api/v1/user",userRoute)
    app.use("/api/v1/auth",authRoute)
    app.use("/api/v1/rating",ratingRoute)
    app.use("/api/v1/coupon",couponRoute)
    app.use("/api/v1/order",orderRoute)
}

module.exports = routes