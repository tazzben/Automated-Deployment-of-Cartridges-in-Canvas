const https = require('https');
const parseLink = require('parse-link-header');
const querystring = require('querystring');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('./settings.json'));

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
    let result = await urlPromise(header, '');
    let d = JSON.parse(result.body);
    data = data.concat(d);
    if (result.headers && result.headers.link) {
        let links = parseLink(result.headers.link);
        if (links.next) {
            let url = new URL(links.next.url);
            header.path = url.pathname.toString() + url.search.toString();
            header.host = url.host.toString();
            return listCourses(header, data);
        }
    }
    return data;
};

const getCourses = async () => {
    let headers = {
        host: settings.canvasURL,
        port: 443,
        path: '/api/v1/courses?state[]=unpublished&per_page=100',
        method: 'GET',
        headers: {
            authorization: 'Bearer ' + settings.token
        }
    };
    return await listCourses(headers);
};

const deployContent = async (id, url) => {
    let content = querystring.stringify({
        "migration_type": "common_cartridge_importer",
        "settings[file_url]": url
    });
    let header = {
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
    return await urlPromise(header, content);
};

module.exports = {
    getCourses: getCourses,
    deployContent: deployContent
};