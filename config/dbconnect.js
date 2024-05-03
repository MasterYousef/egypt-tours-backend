const { default: mongoose } = require("mongoose");

const dbconnect = (key)=>{
    mongoose.connect(key).then(()=>console.log("connect to database successfully"))
}

module.exports = dbconnect;
