const Canvas = require('./Canvas.js');
const GAPIs = require('./Google.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('./settings.json'));

const loopCourses = async () => {
    const courseList = await GAPIs.courseList();
    const timestamp = new Date(Date.now()).toString();
    const courses = await Canvas.getCourses();
    const findMax = (max, b) => {
        if (max.enrollment_term_id < b.enrollment_term_id) {
            return b;
        }
        return max;
    };
    const maxTerm = courses.reduce(findMax).enrollment_term_id;
    let r = [];
    for (const course of courses) {
        if (course.course_code && (course.enrollment_term_id == maxTerm || settings.disableMaxTerm)) {
            const d = new Date(course?.created_at);
            const filteredList = courseList.filter(obj => obj.class == course.course_code.trim().substring(0, obj.class.length) && (d >= obj.date || !(d instanceof Date && !isNaN(d))) && obj.class.length > 0 && obj.url.length > 0);
            for (const c of filteredList) {
                r.push("Deploying to " + course.name + " (" + course.course_code + ")");
                await Canvas.deployContent(course.id, c.url);
            }
        }
    }
    if (courseList.length > 0) {
        await GAPIs.updateSpreadsheet(courseList.length, timestamp);
    }
    return r;
};

const consoleLoop = async () => {
    const r = await loopCourses();
    console.table(r);
}

if (!(!!process.env.GCP_PROJECT || !!process.env.FUNCTION_SIGNATURE_TYPE)) {
    consoleLoop();
}

exports.helloPubSub = (message, ) => {
    const d = message.data ? Buffer.from(message.data, 'base64').toString() : '';
    console.log('PubSub Message: ' + d);
    consoleLoop();
};