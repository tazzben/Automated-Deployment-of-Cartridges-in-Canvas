const Canvas = require('./Canvas.js');

const loopCourses = async () => {
    let courses = await Canvas.getCourses();
    const findMax = (max, b) => {
        if (max.enrollment_term_id < b.enrollment_term_id){
            return b;
        }
        return max;
    };
    let maxTerm = courses.reduce(findMax).enrollment_term_id;
    for (let course of courses){
        if (course.sis_course_id && course.enrollment_term_id == maxTerm){
            console.log(course.name);
        }
    }
};
loopCourses();