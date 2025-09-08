
import express from 'express';
import mongoose from 'mongoose';


const app = express();

app.use(express.json());
app.use(express.urlencoded());


mongoose.connect("mongodb://localhost:27017/StudentDetails")
    .then(()=> console.log("MongoDB Connected"))
    .catch((err)=> console.log("Connection failed"));


const courses = new mongoose.Schema({
    
 title: {type:String},
 code: {type:String,unique:true}, 
 description:{ type:String}

});
const student = new mongoose.Schema({
    
 name: {type:String},
 email: {type:String,unique:true}, 
 enrolledCourses:{ type:[String]}

});
const feedback = new mongoose.Schema({
    
 studentEmail: {type:String},
 courseCode: {type:String}, 
 feedback:{ type:String}

});


const Course = mongoose.model("courses",courses);
const Student = mongoose.model("students",student);
const Feedback = mongoose.model("feedbacks",feedback);

// Courses

app.post("/courses",(req,res)=>{
    const {title,code,description} = req.body;
    Course.create({title,code,description})
        .then(()=> res.status(201).send("Course added"))
        .catch((err)=> res.status(400).send("Error occured"));
});
app.get("/coursesFind",(req,res)=>{
    Course.find({})
        .then((courses)=> res.json(courses))
        .catch((err)=> res.status(404).send("Not found"));
});
app.get("/courses/:code",(req,res)=>{
    const code = req.params.code;

    Course.findOne({code})
        .then((course)=> res.json(course))
        .catch((err)=> res.status(404).send("Not found"));

});
app.put("/coursesUpdate/:code",(req,res)=>{
    
    const code = req.params.code;
    Course.findOneAndUpdate({ code }, req.body, { new: true })
        .then((course)=> {res.json(course)})
        .catch((err)=> {res.status(404).send("Not found")});
});
app.delete("/coursesDeleate/:code",(req,res)=>{
    const code = req.params.code;
    Course.findOneAndDelete({code})
        .then(()=> {res.send("Deleted")})
        .catch((err)=> {res.status(400).send("error")});
});

// Students

app.post("/students",(req,res)=>{
    const {name,email,enrolledCourses} = req.body;
    Student.create({name,email,enrolledCourses})
        .then(()=> res.status(201).send("Student added"))
        .catch((err)=> res.status(400).send("Error occured"));
    });

app.get("/studentFind",(req,res)=>{
    Student.find({})
        .then((students)=> res.json(students))
        .catch((err)=> res.status(404).send("Not found"));
});

app.post("/studentEnroll/:email/enroll/:code",(req,res)=>{
    const code = req.params.code;
    const email = req.params.email;
    Course.findOne({code})
        .then((course)=> {
            if(!course)
                return res.status(404).send("Course not found");
            else
                return Student.findOneAndUpdate({ email },{ enrolledCourses: code }, req.body, { new: true });
        })

        .catch((err)=> res.status(400).send("ERROR"));
});

app.get("/Enrolledstudents/:email/courses",(req,res)=>{
    const email = req.params.email;
    Student.findOne({email})
        .then((student)=> res.json({enrolledCourses:student.enrolledCourses }))
        .catch((err)=> res.status(400).send("Error occured"))
})

// Feedback

app.post("/feedback",(req,res)=>{
    const {studentEmail,courseCode,feedback} = req.body;

    Course.findOne({ code: courseCode })
        .then((course) =>{
            if (!course) {
                return res.status(404).send("Course not found");
            }
        })
        
    Student.findOne({ email: studentEmail })
        .then(student=> {
            if (!student) {
                return res.status(404).send("Student not found");
            }
            if (!student.enrolledCourses.includes(courseCode)) {
            return res.status(400).send("Student is not enrolled in this course");
            }
            
            Feedback.create({studentEmail,courseCode,feedback})
                .then(()=> res.status(201).send("feedback added"))
                .catch((err)=> res.status(400).send("Error occured"))
        .catch((err)=> res.status(400).send("Error occured"))
    })
    .catch((err)=> res.status(400).send("Error occured"))
});

app.get("/feedback/:courseCode",(req,res)=>{
    const courseCode = req.params.courseCode;
    Feedback.findOne({courseCode})
        .then((feedback)=> res.json(feedback))
        .catch((err)=> res.status(404).send("Not found"));
});
app.put("/feedbackupdate/:id",(req,res)=>{
    
    const od = req.params.id;
    Course.findOneAndUpdate({ id }, req.body, { new: true })
        .then((feedback)=> {res.json(feedback)})
        .catch((err)=> {res.status(404).send("Not found")});
});
app.delete("/deletefeedback/:id",(req,res)=>{
    const id = req.params.id;
    Course.findOneAndDelete({id})
        .then(()=> {res.send("Deleted")})
        .catch((err)=> {res.status(400).send("error")});
});

    
app.listen(3000, () => {
  console.log(`Server is listening http://localhost:3000`);
});
