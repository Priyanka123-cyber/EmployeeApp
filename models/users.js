const mongoose=require('mongoose');
   
const userSchema=mongoose.Schema({
    employeeName: { type: String, required: true },
    employeeDesignation: { type: String, required: true },
    employeeLocation:{ type: String, required: true },
    salary:{ type: Number, required: true },
    image:{ type: String, required: true }
    
})

const employeeData=mongoose.model('User',userSchema);
module.exports=employeeData;


