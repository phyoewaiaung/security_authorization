const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_I  = 10;
const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    token:{
        type:String
    }
})

userSchema.pre('save',function(next){
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err) return next(err)
    
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err)
                user.password = hash;
                next();
            })
        })
    }
    else{
        next();
    }
})

userSchema.methods.comparePassword = function(candidatePassword,cb){
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch) {
        if(err) throw cb(err);
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(this._id.toHexString(),'supersecret');

    user.token = token;
    user.save().then(user => {
        cb(null,user)
    }).catch(e => e)
}

userSchema.statics.findByToken = function(token,cb){
    var user = this;

    jwt.verify(token,'supersecret',function(err,decode){
        user.findOne({"_id":decode,"token":token}).then(user => {
            cb(null,user)
        }).catch (e => e)
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }