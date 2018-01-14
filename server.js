const express = require(`express`);
const mongoose = require(`mongoose`);
const passport = require(`passport`);
const strat = require(`passport-local`).Strategy;
const hbs = require(`hbs`);
const bodyParser = require(`body-parser`);
const models = require(`./models`);
const middleware = require(`./middleware`);
const bcrypt = require(`bcryptjs`);
const session = require(`express-session`);
const jwt = require(`jsonwebtoken`);

mongoose.connect(`mongodb://localhost:27017/ggdb`);

let app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:`shashvat`}));
app.use(passport.initialize());
app.use(passport.session());
hbs.registerPartials(__dirname+`/views/partials`);

passport.serializeUser((user,done)=>{
    console.log(`serializer called`);
    user=jwt.sign({user:user._id},`shashvat`);
    done(null,user);
});
passport.deserializeUser((user,done)=>{
    console.log(`deserializer called`);
    user=jwt.verify(user,`shashvat`);
    done(null,user)
});
passport.use(`local`,new strat((username,password,done)=>{
    models.UserModel.findOne({email:username}).then((data)=> {
        if(data){
        bcrypt.compare(password, data.password).then((result) => {
            if (result) {
                done(null, data,{message:`ggdone`});
            }
            else {
                data.msg=`password is wrong`;
                done(null, result);
            }
        }).catch((err) => {
            done(err);
        })
    }
    else{
            data.msg=`no user found`;
            done(null,false)}
    }).catch((err)=>{
        res.status(400).send(`something went wrong in finding user from our database<br>${err}`);
    });


}));

app.set(`view engine`,`hbs`);


app.post(`/loginCheck`,passport.authenticate(`local`,{
    successRedirect:`/home`,
    failureRedirect:`/`
}));
app.post(`/Register`,(req,res)=>{
    if(req.user==undefined){
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
        let newUser = new models.UserModel(req.body);
        newUser.save().then(()=>{
            res.redirect(`/`);
        }).catch((err)=>{res.status(400).send(err.message)});
    }else{
        res.redirect(`/home`);
    }

});
app.get(`/`,(req,res)=>{
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    console.log("home page user req");
    console.log(req.user);
    if(req.user==undefined){
        res.render(`login.hbs`);
    }else{
        res.redirect(`/home`);
    }

});
app.get(`/reg`,(req,res)=>{
    res.render(`register`);
});
app.get(`/tasks`,middleware.authenticate,(req,res)=>{
    console.log(`gg user`);
   //res.send(req.user);
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    models.TaskModel.find({createdBy:req.user.user}).then((tasks)=>{
        console.log(tasks);
        let msg1=``;
        if(tasks.length>=1){
            for(let x in tasks){
                msg1+=`<h4>Task${Number(x)+1} : ${tasks[x].Task}<br>Status : ${tasks[x].status}<br><br></h4>`
            }
            res.send(msg1);
        }
        else{
            res.send(`no tasks found`);
        }
    }).catch((err)=>{
        res.status(400).send(err);
    })
});
app.post(`/addTasks`,middleware.authenticate,(req,res)=>{
    res.header('Cache-Control', 'must-revalidate');
    let newtask = new models.TaskModel({Task:req.body.Task,createdBy:req.user.user});
    newtask.save().then(()=>{res.render(`home.hbs`,{msg:`task saved!`})}).catch((err)=>{res.status(400).send(err)});
});
app.get(`/home`,middleware.authenticate,(req,res)=>{
    console.log(req.session.passport);
    res.header('Cache-Control', 'no-cache, private, no-store,must-revalidate');
    res.render(`home.hbs`);
});
app.get(`/logout`,(req,res)=>{
    req.logout();
    res.redirect(`/`);
});
app.listen(5497,()=>{console.log(`app is listening on 5497`)});