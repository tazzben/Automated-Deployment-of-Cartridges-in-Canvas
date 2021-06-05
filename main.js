const Canvas = require('./Canvas.js');

const loopCourses = async () => {
    let courses = await Canvas.getCourses();
    for (let course of courses){
        if (course.sis_course_id){
            console.log(course);
        }
    }
};
loopCourses();