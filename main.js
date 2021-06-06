const Canvas = require('./Canvas.js');
const GAPIs = require('./Google.js');

const loopCourses = async () => {
    const courseList = await GAPIs.courseList();
    let courses = await Canvas.getCourses();
    const findMax = (max, b) => {
        if (max.enrollment_term_id < b.enrollment_term_id) {
            return b;
        }
        return max;
    };
    let maxTerm = courses.reduce(findMax).enrollment_term_id;
    let r = [];
    for (let course of courses) {
        if (course.sis_course_id && course.enrollment_term_id == maxTerm) {
            let shortClass = course.sis_course_id.trim().substring(0, 8);
            let filteredList = courseList.filter(obj => obj.class == shortClass);
            for (let c of filteredList) {
                r.push("Deploying to " + course.sis_course_id)
                await Canvas.deployContent(course.id, c.url);
            }
        }
    }
    return r;
};

const consoleLoop = async () => {
    let r = await loopCourses();
    console.log(r);
}

if (!(!!process.env.GCP_PROJECT || !!process.env.FUNCTION_SIGNATURE_TYPE)) {
    consoleLoop();
}

exports.pubSubTrigger = (message, _) => {
    const d = message.data ? Buffer.from(message.data, 'base64').toString() : '';
    console.log('PubSub Message: ' + d);
    consoleLoop();
};