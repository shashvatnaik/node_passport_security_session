const mongoose = require(`mongoose`);
const valid = require(`validator`);
const bcrypt = require(`bcryptjs`);
let UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        validate:valid.isEmail
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    }
    });
let TaskSchema = new mongoose.Schema({
    Task:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:`not completed`
    },
    createdBy:{
        type:String,
        required:true
    }
});
UserSchema.pre(`save`,function(done){
    bcrypt.genSalt(10).then((salt=>{
        return bcrypt.hash(this.password,salt);
    })).then((hash)=>{
        this.password=hash;
        console.log(`hash created`);
        done();
    }).catch((err)=>{res.status(400).send(`something went wrong during creating hash of password<>${err}`)});
});
let UserModel = mongoose.model(`usercol`,UserSchema);
let TaskModel = mongoose.model(`TaskModel`,TaskSchema);
module.exports = {UserModel,TaskModel};