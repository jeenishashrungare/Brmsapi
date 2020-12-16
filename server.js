const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const dbs = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'Dynamic28',
        database: 'brms_db'
    }
});

const app = express();

app.use(bodyParser.json());
var corsOptions = {
    origin: 'http://localhost:3001',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

app.post('/signin', (req, res) => {
    dbs.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data => {
       const isValid= bcrypt.compareSync(req.body.password, data[0].hash);
       if(isValid) {
           return dbs.select('*').from('users')
           .where('email','=',req.body.email)
           .then(user => {
               res.json(user[0])
           })
           .catch(err => res.status(400).json('Error getting user'))
       }
       else {
       res.status(400).json('Wrong credentials')
       }
    })
    .catch(err => res.status(400).json('Wrong credentials'))
}
)

app.post('/register', (req, res) => {
    const { name, mobileno, address, email, password } = req.body;
    if(!name || !mobileno || !address || !email || !password) {
        return res.status(400).json('Incorrect form submission!');
    }
    const hash = bcrypt.hashSync(password);
     dbs.transaction(trx => {
         trx.insert({
             hash:hash,
             email:email
         })
         .into('login')
         .returning('email')
         .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                name: name,
                mobileno: mobileno,
                address: address,
                email: loginEmail[0],
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);

         })
    
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('Unable to register!'))
})

app.post('/details', (req, res) => {
    const { bikename,bikeno,licno,owner,emailid,aadharno,phoneno,rent,deposit,status } = req.body;
    if(!bikename || !bikeno || !licno || !owner || !emailid || !aadharno || !phoneno || !rent || !deposit || !status) {
        return res.status(400).json('Incorrect form submission!');
    }
     dbs('bikedetails')
     .returning('*')
     .insert( {
            bikename: bikename,
            bikeno: bikeno,
            licno: licno,
            owner: owner,
            emailid: emailid,
            aadharno: aadharno,
            phoneno: phoneno,
            rent: rent,
            deposit: deposit,
            status: status
         })
         .then(user => {
             res.json(user[0]);
         })
         .catch(err=> res.status(400).json('Something is wrong'))
     })

    
     app.post('/changef', (req, res) => {
        const { bikeid, custlicno,custemail } = req.body;
        
      dbs('bikedetails')
      .where('bikeid', '=', bikeid)
      .update({
          custlicno:custlicno,
          custemail:custemail,
          status: 'archived'
      })
      .then(user => {
        res.json(user[0]);
    })
        .catch(err => res.status(400).json('Error getting data'))
       
    }
    )

app.post('/delbike', (req, res) => {
    const { bikeid } = req.body;
    dbs('bikedetails')
  .where('bikeid', '=', bikeid)
  .del()
  .then(user => {
    res.json('Deleted!');
})
    .catch(err => res.status(400).json('Error getting data'))
   
}
)

app.get('/bikelist', (req,res) => {
    const { bikename,bikeno,licno,owner,emailid,aadharno,phoneno,rent,deposit,status } = req.body;
    dbs.select('*').from('bikedetails')
    .then(user => {
        res.json(user);
    })
    .catch(err => res.status(400).json('Error getting data'))
})

app.post('/newsletter', (req, res) => {
    const { email } = req.body;
    if(!email){
        return res.status(400).json('Incorrect form submission!');
    }
     dbs('newsletter')
     .returning('*')
     .insert( {
            email:email,
            n:'yes'
         })
         .then(user => {
             res.json(user[0]);
         })
         .catch(err=> res.status(400).json('Something is wrong'))
     })
app.listen(3000, () => {
    console.log("App is running on port 3000");
})

