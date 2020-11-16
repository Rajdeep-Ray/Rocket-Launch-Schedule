const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const ora = require('ora');

const url = "https://www.rocketlaunch.live/";

var rocket_schedules = [];

(async () => {

    const spinner = ora({
        text: 'Extracting data..',
        spinner: {
            "interval": 80,
            "frames": [
                "⠋",
                "⠙",
                "⠹",
                "⠸",
                "⠼",
                "⠴",
                "⠦",
                "⠧",
                "⠇",
                "⠏"
            ]
        }
    }).start();
    
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

                let provider_list = [];
                $('div[class="rlt-provider"]').each((i, e) => {
                    provider_list.push($(e).text());
                })

                let location_list = [];
                $('div[class="rlt-location"]').each((i, e) => {
                    location_list.push($(e).text().trim().replace('\n', ', '));
                })

                for (let i = 0; i < rocket_details.length; i++) {
                    rocket_details[i]['schedule'] = schedule_list[i];
                    rocket_details[i]['provider'] = provider_list[i];
                    rocket_details[i]['location'] = location_list[i];
                    rocket_schedules.push(rocket_details[i])
                }
                // console.log(rocket_details);
            }).catch((err) => {
                console.log(err)
            });
    }
    console.log(rocket_schedules);
    spinner.succeed('Data Collected!')
    fs.writeFile("rocket-schedule.json", JSON.stringify(rocket_schedules), (err) => {
        if (err) {
            throw err;
        }
        // console.log("File Created!");
        spinner.succeed('JSON file created!')

    });

    const fields = [{
        label: 'Mission',
        value: 'mission'
    }, {
        label: 'Vehicle',
        value: 'vehicle'
    }, {
        label: 'Schedule',
        value: 'schedule'
    }, {
        label: 'Provider',
        value: 'provider'
    }, {
        label: 'Location',
        value: 'location',
    }];

    const json2csvParser = new Parser({ fields })
    const csv = json2csvParser.parse(rocket_schedules);
    // console.log(csv);
    fs.writeFile("rocket-schedule.csv", csv, (err) => {
        if (err) {
            throw err;
        }
        // console.log("File Created!");
        spinner.succeed('CSV file created!')
    });
    spinner.stop()

})();
