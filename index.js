const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.rocketlaunch.live/";

(async () => {
    for (let i = 1; i < 8; i++) {
        await axios.get(url + '?page=' + i)
            .then((res) => {
                let $ = cheerio.load(res.data);
                $('div[id=upcoming_launches_header]').remove()
                let launch_list=[]
                let mission_vehicle = {}
                $('h4').each((i, e) => {
                    if (i % 2 == 0) {
                        mission_vehicle['mission'] = $(e).text().replace('\n', '');
                    }
                    else {
                        mission_vehicle['vehicle'] = $(e).text().replace('\n', '');
                        launch_list.push(mission_vehicle);
                        mission_vehicle={};
                    }
                })
                
                console.log(launch_list);
            }).catch((err) => {
                console.log(err)
            });
    }
})();
