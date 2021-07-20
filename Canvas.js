const https = require('https');
const parseLink = require('parse-link-header');
const settings = require('./loadSettings.js').loadSettings();

const urlPromise = (urlOptions, data) => {
    return new Promise((resolve, reject) => {
        const req = https.request(urlOptions,
            (res) => {
                let body = '';
                res.on('data', (chunk) => (body += chunk.toString()));
                res.on('error', reject);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: body
                        });
                    } else {
                        reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                    }
                });
            });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
};

const listCourses = async (header, data = []) => {
    const result = await urlPromise(header, '').catch(() => {
        console.log("There was a problem retrieving the courses from Canvas");
        return {
            "body": "{}"
        }
    });
    const d = JSON.parse(result.body);
    data = data.concat(d);
    if (result.headers?.link) {
        const links = parseLink(result.headers.link);
        if (links.next) {
            const url = new URL(links.next.url);
            header.path = url.pathname.toString() + url.search.toString();
            header.host = url.host.toString();
            return listCourses(header, data);
        }
    }
    return data;
};

const getCourses = async () => {
    let state = (settings.state == "available") ? "state[]=available&state[]=unpublished" : "state[]=unpublished";
    if (settings.admin) {
       state =  (settings.state == "available") ? "state[]=available&completed=false&blueprint=false" : "published=false&completed=false&blueprint=false";
    }
    const path = (settings.endpoint && settings.endpoint?.length > 0) ? settings.endpoint + "?recursive=1&" : '/api/v1/courses?';
    const headers = {
        host: settings.canvasURL,
        port: 443,
        path: path  + '&per_page=50',
        method: 'GET',
        headers: {
            authorization: 'Bearer ' + settings.token
        }
    };
    return await listCourses(headers);
};

const deployContent = async (id, url) => {
    const content = new URLSearchParams({
        "migration_type": "common_cartridge_importer",
        "settings[file_url]": url
    }).toString();
    const headers = {
        host: settings.canvasURL,
        port: 443,
        path: '/api/v1/courses/' + id.toString() + '/content_migrations',
        method: 'POST',
        headers: {
            authorization: 'Bearer ' + settings.token,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': content.length
        }
    };
    return await urlPromise(headers, content).catch(() => {
        console.log("There was a problem deploying content to Canvas");
        return;
    });
};

module.exports = {
    getCourses: getCourses,
    deployContent: deployContent
};