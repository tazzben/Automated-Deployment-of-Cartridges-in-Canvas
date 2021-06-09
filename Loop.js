const Canvas = require('./Canvas.js');
const GAPIs = require('./Google.js');
const importCSV = require('./importcsv.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('./settings.json'));

const loopCourses = async (filename = "") => {
    let courseList;
    let saveable = [];
    if (filename.length > 0){
        ({courseList, saveable} = await importCSV.importCSV(filename));
    } else {
        courseList = await GAPIs.courseList();
    }
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
    if (courseList.length > 0 && filename.length == 0) {
        await GAPIs.updateSpreadsheet(courseList.length, timestamp);
    } else if (saveable.length > 0 && courseList.length) {
        await importCSV.exportCSV(filename, saveable);
    }
    return r;
};

const consoleLoop = async (filename = "") => {
    const r = await loopCourses(filename);
    console.table(r);
}

module.exports = {
    consoleLoop: consoleLoop,
};