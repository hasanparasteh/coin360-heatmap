"use strict";

const puppeteer = require('puppeteer');
const fs = require("fs");


async function take_screenshot(filename) {
    const browser = await puppeteer.launch({
        executablePath: args[0],
        headless: true,
        ignoreHTTPSErrors: true,
        args: [`--window-size=${1240},${796}`],
        defaultViewport: {
            width: 796,
            height: 1240
        }
    });
    const page = await browser.newPage();

    console.log("Starting App...");

    await page.goto('https://coin360.com/', {
        waitUntil: 'domcontentloaded',
        timeout: 300 * 1000
    }).then(async () => {
        try {
            console.log("Waits for page fully loaded")
            await page.waitForNetworkIdle({ timeout: 10 * 1000 })
        } catch {
            console.log("I can't wait any more :( ")
        }
        // Hide some html elements
        console.log("Adds stylesheets")
        await page.addStyleTag({ content: 'header, div.MapFiltersContainer, section.NewsFeed, .TreeMaps__ZoomControls, .TopLeaderboard { display: none; }' })

        // Remove Ads
        console.log("Starts to remove ads...")
        try {
            await page.waitForSelector("button.CookiesBanner__AcceptButton", { timeout: 5000 })
            await page.click('button.CookiesBanner__AcceptButton');
        } catch (error) {
            console.log("The element didn't appear.")
        }
        try {
            await page.waitForSelector("button.StickyCorner__Close", { timeout: 5000 })
            await page.click('button.StickyCorner__Close');
        } catch (error) {
            console.log("The element didn't appear.");
        }

        console.log("takes a screen shot....")
        await page.screenshot({ path: filename });

        await browser.close();
    });
}

const args = process.argv.slice(2);
if (args[0] === null || args[0] === undefined || args[0] === "") {
    console.log("ERROR: Please Enter Chrome Executable Path")
    console.log("Example: ./coin360 <path>")
    process.exit(1)
}

const main = async () => {
    let filesize = 0;
    const filename = new Date().getTime() + ".png"

    do {
        await take_screenshot(filename)
        try {
            filesize = fs.statSync(filename).size;
        } catch (error) {
            console.log(error);
        } finally {
            console.log("File size is: ", filesize)
        }
    } while (filesize < 90000) // It's must be greater than 90kb

    console.log("Enjoy your file...\n");
}

try {
    main()
} catch (error) {
    console.log("Can't take a screenshot :(");
}