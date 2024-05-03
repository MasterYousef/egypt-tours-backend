const devHandler = (err,res)=>{
    res.status(err.statusCode).json({
        statusCode: err.statusCode,
        status: err.status,
        message: err.message,
        stack: err.stack
    })
}
const prodHandler = (err,res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })
}
const globalError = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if(process.env.NODE_ENV === "development"){
        devHandler(err,res)
    }else{
        prodHandler(err,res)
    }
}
module.exports = globalError