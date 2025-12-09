const DOMAIN = "unavarra.es"; 
const COOKIE_LIST = ["JSESSIONID", "SAKAISESSIONID", "SERVERID"];
const EXTRA_DAYS = 366;

function extendCookie(cookie) {
    // extend EXTRA_DAYS from now
    const newDate = Math.floor(Date.now() / 1000) + (EXTRA_DAYS * 24 * 60 * 60);

    // copy cookie as is replacing expirationDate
    const url = "https://" + cookie.domain.replace(/^\./, "") + cookie.path;

    browser.cookies.set({
      url: url,
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      expirationDate: newDate,
      storeId: cookie.storeId
    }).then(() => {
      console.log(`✅ Cookie ${cookie.name} extended.`);
    }).catch((error) => {
      console.error(`❌ Error extending ${cookie.name}: ${error}`);
    });
}

function testAndExtend() {
    browser.cookies.getAll({ domain: DOMAIN }).then((cookies) => {
        let modifiedCount = 0;

        cookies.forEach((cookie) => {
            // check cookie is in target list
            if (COOKIE_LIST.includes(cookie.name)) {
                
                // check if session cookie OR expires less than 100 days from now
                const threshold = (Date.now() / 1000) + (100 * 24 * 60 * 60);

                if (!cookie.expirationDate || cookie.expirationDate < threshold) {
                     extendCookie(cookie);
                     modifiedCount++;
                }
            }
        });
    });
}

// run on load
testAndExtend();

browser.webNavigation.onCompleted.addListener(testAndExtend, {
    url: [{hostContains: "unavarra.es"}]
});