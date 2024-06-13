import { exit, log } from '../../utils/command-helpers.js';
import openBrowser from '../../utils/open-browser.js';
export const openSite = async (options, command) => {
    const { siteInfo } = command.netlify;
    await command.authenticate();
    const url = siteInfo.ssl_url || siteInfo.url;
    log(`Opening "${siteInfo.name}" site url:`);
    log(`> ${url}`);
    // @ts-expect-error TS(2345) FIXME: Argument of type '{ url: any; }' is not assignable... Remove this comment to see the full error message
    await openBrowser({ url });
    exit();
};
