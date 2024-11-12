const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// Configure multer storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: storage });

// GET: Home Page
router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
            title: 'Home Page',
            users: users
        });
    } catch (err) {
        res.json({
            message: err.message
        });
    }
});

// GET: Add Employee Page
router.get('/add', (req, res) => {
    res.render('add_emp', { title: 'Add Employee' });
});

// POST: Add Employee (with file upload)
router.post('/add', upload.single('image'), (req, res) => {
    const user = new User({
        employeeName: req.body.employeeName,
        employeeDesignation: req.body.employeeDesignation,
        employeeLocation: req.body.employeeLocation,
        salary: req.body.salary,
        image: req.file.filename
    });

    user.save()
    .then(() => {
        req.session.message = {
            type: 'success',
            message: 'Employee added successfully!'
        };
        res.redirect('/');
    }).catch((err) => {
        res.json({ message: err.message, type: 'danger' });
    });
});

// GET: Edit Employee
// To edit employee data
const mongoose = require('mongoose');

router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format.' });
    }

    try {
        const user = await User.findById(id).exec(); // Use async/await instead of callback

        if (!user) {
            return res.redirect('/'); // User not found, redirect
        }

        res.render('edit_emp', { title: 'Edit Employee Data', user: user });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.redirect('/'); // Redirect on error
    }
});



// POST: Update Employee Data (with file upload)
router.post('/update/:id', upload.single('image'), async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image); // delete the old image file
        } catch (error) {
            console.log('Error while deleting old image:', error);
        }
    } else {
        new_image = req.body.old_image; // retain the old image if no new file is uploaded
    }

    try {
        // Async/await used for Mongoose operations
        await User.findByIdAndUpdate(id, {
            employeeName: req.body.employeeName,
            employeeDesignation: req.body.employeeDesignation,
            employeeLocation: req.body.employeeLocation,
            salary: req.body.salary,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'Employee Data updated successfully'
        };
        res.redirect('/');
    } catch (err) {
        console.error('Error while updating employee:', err);
        res.status(500).json({ message: err.message, type: 'danger' });
    }
});

//Delete user route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;

    try {
        const result = await User.findByIdAndDelete(id).exec(); // Change to findByIdAndDelete

        if (result && result.image) {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (error) {
                console.log('Error while deleting image:', error);
            }
        }

        req.session.message = {
            type: 'info',
            message: "Employee Data deleted successfully"
        };
        res.redirect('/');
    } catch (err) {
        console.error('Error while deleting user:', err);
        res.json({ message: err.message });
    }
});



module.exports = router;
