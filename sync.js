import * as fs from "fs";
import got from 'got';
import _ from "lodash";

const isValidEmail = /^(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){255,})(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){65,}@)(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22))(?:\.(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22)))*@(?:(?:(?!.*[^.]{64,})(?:(?:(?:xn--)?[a-z0-9]+(?:-[a-z0-9]+)*\.){1,126}){1,}(?:(?:[a-z][a-z0-9]*)|(?:(?:xn--)[a-z0-9]+))(?:-[a-z0-9]+)*)|(?:\[(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9][:\]]){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?)))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))\]))$/;

async function stopForumSpam() {
    let response = await got('https://www.stopforumspam.com/downloads/toxic_domains_whole.txt');
    return response.body.split('\n');
}

async function andreisDisposableEmailDomains() {
    let response = await got('https://raw.githubusercontent.com/andreis/disposable-email-domains/master/domains.txt');
    return response.body.split('\n');
}

async function allowList() {
    return fs.readFileSync('./allow-list.txt')
        .toString()
        .split('\n')
        .filter(line => line.trim() !== '' && !line.trim().startsWith('#'));
}

async function denyList() {
    return fs.readFileSync('./deny-list.txt')
        .toString()
        .split('\n')
        .filter(line => line.trim() !== '' && !line.trim().startsWith('#'));
}

(async () => {
    const allowDomainsSet = new Set(await allowList());
    let list = _.uniq(
        _.concat(
            await stopForumSpam(),
            await andreisDisposableEmailDomains(),
            await denyList()
        ))
        .filter(domain => !allowDomainsSet.has(domain) && isValidEmail.test(`hi@${domain}`))

    fs.writeFileSync('list.json', JSON.stringify(list));
    fs.writeFileSync('list.txt', list.join('\n'));
    fs.writeFileSync('shields.json', JSON.stringify({
        schemaVersion: 1,
        label: 'total number',
        message: `${list.length}`
    }))
})();
