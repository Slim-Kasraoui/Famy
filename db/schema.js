const mongoose = require("mongoose");

const schemaUsers = new mongoose.Schema({ 
    name: String,
    password:String,
    AccountNumber:Number,
    email:String,
    tokens:Number,
    currentskin:Number,
    friends:[{name:String,Messages:Array}],
    invitation:[{from:String,To:String,id:Number}],
    AccountStatus:{Banned:Boolean,Reason:String,Periode:String},
    Balance:Number
  })

  const Users= mongoose.model('Users', schemaUsers);

  const schemaAccountNumber=new mongoose.Schema({AccountNumber:Number})

const AccountNumberdB=mongoose.model('AccountNumber', schemaAccountNumber);

const id=new AccountNumberdB({AccountNumber:0})

const registerUser = async function (data, res) {
  var AccountNumber;
  var user;
  await Users.findOne({ name: data.name }).then((result) => {user = result;});
  if (user !== null) {
    console.log("done");
    res.send({ Registred: true });
  }else {
    await AccountNumberdB.find().then((data) => {AccountNumber = data[0].AccountNumber;});

    await AccountNumberdB.updateOne({ AccountNumber: AccountNumber + 1 });

    return new Users({
        email:data.email,
      name: data.name,
      password: data.password,
      AccountNumber: AccountNumber,
      currentskin:"",
      friends:[],
      invitation:[],
      AccountStatus:{Banned:false,Reason:"",Periode:""},
      Balance:0
    }).save((err, doc) => {
      console.log(doc.AccountNumber)
      res.send({id:doc.AccountNumber})
    });
  }
};

const loginUser = async function (data, res) {
  await Users.findOne({ name: data.name }).then((result) => {
    console.log(result)
    if (result === null) {
      res.send({ Registred: false});
    } else {
      if (result.password === data.password) {
        res.send({
          Registred: true,
          data: { name: result.name, Id: result.AccountNumber,skin:result.currentskin},
        });
      } else {
        res.send({ Registred: false });
      }
    }
  });
};

const updateskin=function(id,currentskin,res){
  Users.update({AccountNumber:id},{currentskin}).then(result=>{res.send("Selected")})
}

const schemainvitationid=new mongoose.Schema({Iid:Number})// InvitationsId

const invitationid=mongoose.model('invitationid', schemainvitationid);

const Iid=new invitationid({Iid:0})

const invitation=async function(from,to,res){
  var fromN=''
  var Nid=null
  await Users.findOne({ AccountNumber: from }).then((result) => {fromN=result.name})
  await invitationid.findOne().then(data=>{
    Nid=data.Iid
  })
  await invitationid.update({},{Iid:Nid+1})
  await Users.update({AccountNumber:to},{$push:{invitation:{from:fromN,To:to,id:Nid}}})
res.send()
}

const fetchinvitations=function(id,res){
Users.findOne({AccountNumber:id}).then(data=>{
  res.send(data.invitation)
})
}

const acceptinvitation=async function(userId,invId,res){
  var inv=undefined
  var invP=undefined
  var finalR=[]
  var username=undefined
await Users.findOne({AccountNumber:userId}).then(result=>{
  username=result.name
  var r=result.invitation
  for(var i=0;i<r.length;i++){
    if(r[i].id==invId){
      inv=r[i].from
      console.log(inv,"from",userId,"To")
    }
    if(r[i].id!=invId){
      finalR.push(r[i])
    }
  }
})
await Users.update({AccountNumber:userId},{invitation:finalR})
await Users.update({AccountNumber:userId},{$push:{friends:{name:inv,Messages:[]}}}).catch(err=>{console.log(err)})
await Users.update({name:inv},{$push:{friends:{name:username,Messages:[]}}}).catch(err=>{console.log(err)})
res.send()
}

const rejectinvitation=async function(userId,invId,res){
  var inv=undefined
  var invP=undefined
  var finalR=[]
  var username=undefined
  await Users.findOne({AccountNumber:userId}).then(result=>{
    username=result.name
    var r=result.invitation
    for(var i=0;i<r.length;i++){
      if(r[i].id==invId){
        inv=r[i].from
      }
      if(r[i].id!=invId){
        finalR.push(r[i])
      }
    }
  })
  await Users.update({AccountNumber:userId},{invitation:finalR})
res.send()
}

const fetchfriends=async function(id,res){
  await Users.findOne({AccountNumber:id}).then(result=>{
    res.send(result.friends)
  })
  }

  const sendmsg=async function(from,to,msg,res,position){
    var newMessages0=undefined
    var newfriends0=undefined
await Users.findOne({name:from}).then(result=>{
  newfriends0=result.friends
  newMessages0=result.friends[position].Messages
  newMessages0.push({from:from,to:to,message:msg})
  newfriends0.Messages=newMessages0
})
await Users.update({name:from},{friends:newfriends0}).then(result=>{
  console.log(result)
})
//secound user
var newfriends=undefined
var newMessages=undefined
await Users.findOne({name:to}).then(result=>{
  newfriends=result.friends
  newMessages=result.friends[position].Messages
  newMessages.push({from:from,to:to,message:msg})
  newfriends.Messages=newMessages
  console.log(newfriends.Messages)
})
await Users.update({name:to},{friends:newfriends})
res.send()
  }

  const UpdataBalance=async function(id,balance,res){
    await Users.update({AccountNumber:id},{Balance:balance}).then(result=>{
   res.send()
    })
  }
  const Getbalance=async function(id,res){
    await Users.findOne({AccountNumber:id}).then(result=>{
      res.send({balance:result.Balance})
    })
  }

module.exports = {
  
  registerUser,
  loginUser,
  Users,
  id,
  updateskin,
  Iid,
  invitation,
  fetchinvitations,
  acceptinvitation,
  rejectinvitation,
  fetchfriends,
  sendmsg,
  UpdataBalance,
  Getbalance
};

