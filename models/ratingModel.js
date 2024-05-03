const { default: mongoose } = require("mongoose");
const tour = require("./tourModel");

const schema = new mongoose.Schema({
  comment: {
    type: String,
    maxlenght: [100, "comment characters must be less than 100 characters"],
    minlenght: [2, "comment characters must be more than 2 characters"],
  },
  rate: {
    type: Number,
    required:[true,"rate is required"],
    min: [1, "rate must be grater than 1"],
    max: [5, "rate must be less than equal 5"],
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required:[true,"rating must belong to user"]
  },
  tour:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "tour",
    required:[true,"rating must belong to tour"]
  }
});

schema.statics.tourRatingAverageAndQuantity = async function(tourId){
  const result = await this.aggregate([
    { $match :{ tour: tourId} },
    { $group : {
      _id: "$tour",
      ratingQuantity: { $sum: 1 },
      avgRating: { $avg: "$rate" },
    }}
  ])
  if(result.length > 0){
    await tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: result[0].ratingQuantity,
      ratingsAverage: result[0].avgRating.toFixed(1),
    });
  }else{
    await tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
}

schema.post("save",async function(){
 await this.constructor.tourRatingAverageAndQuantity(this.tour)
})

schema.post("findOneAndUpdate",async (doc) =>{
  console.log("a7a");
  await doc.constructor.tourRatingAverageAndQuantity(doc.tour)
 })

 schema.post("findOneAndDelete",async (doc) =>{
  await doc.constructor.tourRatingAverageAndQuantity(doc.tour)
 })

const rating = mongoose.model("rating", schema);

module.exports = rating;
