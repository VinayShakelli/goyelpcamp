const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error!"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            author : '60c8bfa01c81b408dd185628',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo quasi officiis similique, fuga incidunt sint deserunt sequi aut, maxime odit natus aspernatur eius minima vel molestiae tempora dicta quos? Quia.',
            price,
            geometry: { 
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images : [
                {
                    url: 'https://res.cloudinary.com/dq61kycjc/image/upload/v1623836796/YelpCamp/yi5pk3itynqgrockwubi.jpg',
                    filename: 'YelpCamp/yi5pk3itynqgrockwubi'
                },
                {
                  url: 'https://res.cloudinary.com/dq61kycjc/image/upload/v1623836796/YelpCamp/zcutaadsozto74oz7stq.jpg',
                  filename: 'YelpCamp/zcutaadsozto74oz7stq'
                }
              ]
        })
        await camp.save(); 
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
