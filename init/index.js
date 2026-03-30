const mongoose=require("mongoose")
const Listing=require("../models/listing.js")
const initData=require("./data.js")


async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}
main().then(()=>{
    console.log("connected sucessfully")
})

const initDB=async()=>{
    await Listing.deleteMany({}),
  initData.data = initData.data.map((obj)=>({
   ...obj,
   owner: "69c420fa2658de4eeaa2d43d"
}))
    await Listing.insertMany(initData.data)
    console.log("Data was initialised")
}
initDB();