

const express = require('express')
const app = express()

const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const { MongoClient } = require('mongodb')

const client = new MongoClient('mongodb+srv://ayshaaaa212_db_user:dbuser@cluster0.goz0bjh.mongodb.net/')

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))



async function connectTomangoDB() {

    try {

        await client.connect()

        console.log('MongoDB Connected')

        app.listen(3001, () => {
            console.log('Server running on port 3001')
        })

    } catch (error) {

        console.log(error)

    }

}



app.get('/', async (req, res) => {

    const database = client.db('school')
    const students = database.collection('students')
    const totalStudents = await students.countDocuments()
    
    const allStudents = await students.find().toArray()
    const classCounts = []

    for (let i = 0; i < allStudents.length; i++) {
        const className = allStudents[i].className

        let found = false
        for (let j = 0; j < classCounts.length; j++) {
            if (classCounts[j].className === className) {

                classCounts[j].count++

                found = true

                break

            }

        }
        if (found === false) {
            classCounts.push({
                className: className,
                count: 1
            })
        }
    }
    res.render('dashboard', {

        totalStudents: totalStudents,
        classCounts: classCounts

    })

})



app.get('/students', async (req, res) => {

    const database = client.db('school')
    const students = database.collection('students')

    const allStudents = await students.find().sort({ name: 1 }).toArray()

    res.render('students', {
        students: allStudents,
        className: req.params.className
    })

})



app.get('/students/add', (req, res) => {
    res.render('add-student')

})

app.post('/students/add', async (req, res) => {

    const database = client.db('school')
    const students = database.collection('students')

    await students.insertOne({

        id: String(Date.now()),
    name: req.body.name,
    rollNo: req.body.rollNo,
    className: req.body.className,
    age: Number(req.body.age),
    gender: req.body.gender,
    phone: req.body.phone,
    address: req.body.address
    })

    res.redirect('/students')

})



app.get('/classes/:className', async (req, res) => {

    const database = client.db('school')
    const students = database.collection('students')

    const classStudents = await students.find({

        className: req.params.className

    }).sort({ name: 1 }).toArray()

    res.render('students', {

        students: classStudents,
        className: req.params.className

    })

})



app.get('/students/profile/:id', async (req, res) => {
 console.log('Profile route is working!')
    console.log('Student ID:', req.params.id)
    const database = client.db('school')
    const students = database.collection('students')

    const student = await students.findOne({
        id: req.params.id
    })

    if (student) {
        res.render('profile', {
            student: student
        })
    } else {
        res.send('Student not found')
    }

})

connectTomangoDB()

