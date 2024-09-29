require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const session=require('express-session');

const app= new express();
const PORT=process.env.PORT;

mongoose.connect(process.env.DB_URL)
.then(()=>{   
    console.log("Connection established with Database");
})
.catch(()=>{
    console.log("Error in connection");
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'your-secret-key',  // Used to sign the session ID cookie
    resave: false,              // Prevents saving session back to the store if it wasn't modified during the request
    saveUninitialized: false,   // Forces an uninitialized session to be saved to the store
  }));

  app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message
    next();
  });

  app.use(express.static('uploads'));

  app.set('view engine','ejs');
  app.use("",require('./routes/routes'))


// app.get('/',(req,res)=>{
//     res.send("Hello World");
// })

app.listen(PORT, ()=>{
    console.log(`Server initiated at http://localhost:${PORT}`);
})