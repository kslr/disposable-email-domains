const got = require('got');
const _ = require('lodash');
const fs = require('fs');
const p = require('path');

const isValidEmail = /^(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){255,})(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){65,}@)(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22))(?:\.(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22)))*@(?:(?:(?!.*[^.]{64,})(?:(?:(?:xn--)?[a-z0-9]+(?:-[a-z0-9]+)*\.){1,126}){1,}(?:(?:[a-z][a-z0-9]*)|(?:(?:xn--)[a-z0-9]+))(?:-[a-z0-9]+)*)|(?:\[(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9][:\]]){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?)))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))\]))$/;


async function stopforumspam() {
    let response = await got('https://www.stopforumspam.com/downloads/toxic_domains_whole.txt');
    return response.body.split('\n');
}

async function fgribreau_mailchecker() {
    let response = await got('https://raw.githubusercontent.com/FGRibreau/mailchecker/master/list.txt');
    return response.body.split('\n');
}

async function andreis_disposable_email_domains() {
    let response = await got('https://raw.githubusercontent.com/andreis/disposable-email-domains/master/domains.txt');
    return response.body.split('\n');
}

(async () => {
    let list = await _.filter(
        await _.uniq(
            await _.concat(
                await stopforumspam(),
                await fgribreau_mailchecker(),
                await andreis_disposable_email_domains()
            )), (domain) => {
            let email = `hi@${domain.toLowerCase()}`;
            return isValidEmail.test(email);
    });

    fs.writeFileSync(p.resolve(__dirname, 'list.json'), JSON.stringify(list));
    fs.writeFileSync(p.resolve(__dirname, 'list.txt'), list.join('\n'));
    fs.writeFileSync(p.resolve(__dirname, 'shields.json'), JSON.stringify({
        schemaVersion: 1,
        label: 'total number',
        message: `${list.length}`
    }))
})();
