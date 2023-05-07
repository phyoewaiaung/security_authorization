const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/auth');

  const {User} = require('./models/user');
  const {auth} = require('./middleware/auth')
  app.use(bodyParser.json());
  app.use(cookieParser())

  app.post('/api/user',(req,res)=> {
    const user = new User({
      email:req.body.email,
      password:req.body.password
    });

    user.save().then( doc => {
      res.status(200).send(doc)
    }).catch(err => {
      res.status(400).send(err)
    })
  })

  app.post('/api/user/login',(req,res)=> {
    User.findOne({"email":req.body.email}).then(user=> {
      if(!user) res.json({message:'Auth failed, user not found'})
     
      user.comparePassword(req.body.password,(err,isMatch)=> {
        if(err) throw err;
        if(!isMatch) return res.status(400).json({
          message:'Wrong Password'
        })
        user.generateToken((err,user)=> {
          if(err) return res.status(400).send(err);

          res.cookie('auth',user.token).send('ok')
        })
      })

    }).catch((e) => e)
  })


  app.get('/user/profile',auth,(req,res)=> {
    res.status(200).send(req.token)
  })
}

const app = express();

const port = process.env.PORT || 3000;

app.listen(port,()=> {
    console.log(`started on port ${port}`);
})