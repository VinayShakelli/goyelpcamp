if( process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
//require('dotenv').config();
//console.log(process.env.CLOUDINARY_SECRET);
//console.log(process.env.CLOUDINARY_KEY);


const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require('joi');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require("connect-mongo")(session);

const db_url = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const campgroundRoutes = require('./routes/campgounds')
const reviewRoutes = require('./routes/reviews');
const UserRoutes = require('./routes/users');


//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(db_url,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error!"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); 

const secret = process.env.SECRET || 'thisshouldbeabettersecret!!';

const store = new MongoDBStore({
    url : db_url,
    secret,
    touchAfter : 24 * 60 * 60 
});

store.on("error" , function(e) {
    console.log("session error",e);
});

const sessionConfig = {
    store,
    secret ,
    resave: false,
    saveUninitialized : true,
    cookie: {
        httpOnly: true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dq61kycjc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 

app.use( (req, res, next)=> {
    //console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', UserRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
);



app.get('/', (req, res) => {
    res.render('home')
});



app.all('*',(req, res, next) => {
    next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh No, Something went wrong!!!";
    res.status(statusCode).render('error',{err});
});

app.listen(3000, () => {
    console.log('serving on port 3000!!!')
})