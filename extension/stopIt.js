//adding hook to request
browser.webRequest.onBeforeRequest.addListener(
  handleHTTPRequest,
  {urls:[
	"*://*.facebook.com/*", 		//regexp or specific link
   	"*://*.mercadolibre.com.ar/*",
    "*://*.reddit.com/*",
	"*://*.instagram.com/*",
	"*://*.cuevana3.io/*"

	]},
  ["blocking"]
);


//function to create notification
function notifyUser(fromTime, toTime){
    browser.notifications.create({
      "type": "basic",
      "iconUrl": "icons/logos_64.png",
      "title": "Site Blocked",
      "message": `From ${fromTime} hrs to ${toTime} hrs`
	});
}

//function to create promise and check if we should block the request or not
function handleHTTPRequest(details) {

	let shallNotify = true;
	if(details.originUrl && details.originUrl !== 'undefined')
		shallNotify = false;
	const blockRequest = new Promise((resolve) => {
		gettingItem = browser.storage.local.get('blockHrsTSL'); 
		gettingItem.then((res) => {
			if(res && res.blockHrsTSL) {
				let fromTime = res.blockHrsTSL.fromHrs || 0;
				let toTime = res.blockHrsTSL.toHrs || 24;

				if(fromTime == 0 && toTime == 0) resolve(false);

				if(isBlocked(fromTime, toTime)){
					if(shallNotify) notifyUser(fromTime, toTime);
					resolve({ cancel: true });
				}
			}

		  resolve(false);
		});
	});
	return blockRequest;
}

function isBlocked(from, to){

	const rightNowDate = new Date();
	const rightNow = rightNowDate.getHours() * 60 + rightNowDate.getMinutes();
	const fromTime = from * 60;
	const toTime = to * 60;

	if (
		(
			toTime < fromTime &&
			(
				(rightNow >= fromTime && rightNow <= 24*60) ||
				(rightNow > 0 && rightNow <= toTime)
			)
		) ||
		(rightNow >= fromTime && rightNow <= toTime)
	) return true;
	else
		return false;
}
