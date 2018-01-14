let authenticate = (req,res,next)=>{
    if(req.user){
        next();
    }else {
        res.render(`login.hbs`,{alert:`you need to login first!`});
    }
};
module.exports={authenticate};