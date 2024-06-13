import { exit, log } from '../../utils/command-helpers.js';
import openBrowser from '../../utils/open-browser.js';
export const openAdmin = async (options, command) => {
    const { siteInfo } = command.netlify;
    await command.authenticate();
    log(`Opening "${siteInfo.name}" site admin UI:`);
    log(`> ${siteInfo.admin_url}`);
    // @ts-expect-error TS(2345) FIXME: Argument of type '{ url: any; }' is not assignable... Remove this comment to see the full error message
    await openBrowser({ url: siteInfo.admin_url });
    exit();
};
