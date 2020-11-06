const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.rocketlaunch.live/";

var rocket_schedules = [];

(async () => {
    for (let i = 1; i < 8; i++) {
        await axios.get(url + '?page=' + i)
            .then((res) => {
                let $ = cheerio.load(res.data);
                $('div[id=upcoming_launches_header]').remove()
                let rocket_details = []
                let mission_vehicle = {}
                $('h4').each((i, e) => {
                    if (i % 2 == 0) {
                        mission_vehicle['mission'] = $(e).text().replace('\n', '');
                    }
                    else {
                        mission_vehicle['vehicle'] = $(e).text().replace('\n', '');
                        rocket_details.push(mission_vehicle);
                        mission_vehicle = {};
                    }
                })

                let schedule_list = [];
                $('div[class="launch_date rlt_date"]').each((i, e) => {
                    schedule_list.push($(e).text());
                })

                for (let i = 0; i < rocket_details.length; i++) {
                    rocket_details[i]['schedule'] = schedule_list[i];
                    rocket_schedules.push(rocket_details[i])
                }
                // console.log(rocket_details);
            }).catch((err) => {
                console.log(err)
            });
    }
    console.log(rocket_schedules);
})();
