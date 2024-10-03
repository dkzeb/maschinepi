import 'dotenv/config';

export class SampletteIOAPI {


    static async getSample() {
        const data = await fetch("https://samplette.io/get_sample", {
          "headers": {
            "accept": "*/*",
            "accept-language": "da,en;q=0.9,en-US;q=0.8,da-DK;q=0.7,en-DK;q=0.6",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "Referer": "https://samplette.io/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": "{\"id\":null,\"exclude\":[],\"previous-ids\":[" + Math.floor(Math.random() * 999999) + "],\"kind\":\"random\",\"count\":10,\"repeat-between-sessions\":false}",
          "method": "POST"
        }).then(async (response) => {
            console.log('SampletteIO said:');
            console.dir(await response.json())
        });

        if(process.env.DEVMODE === "true") {
            console.log('Response');
            console.dir(data);
        }

        return data;
    }
}

(async () => {
    SampletteIOAPI.getSample();
})();