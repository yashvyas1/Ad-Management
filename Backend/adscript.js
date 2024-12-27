
(async function () {
    function getIDsFromScript() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const src = script.src;
            if (src.includes('ad-script.js')) {
                const queryString = src.split('?')[1];
                const urlParams = new URLSearchParams(queryString);
                const publisherID = urlParams.get('publisherID');
                const websiteID = urlParams.get('websiteID');
                return { publisherID, websiteID };
            }
        }
        return { publisherID: null, websiteID: null };
    }

    function getDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/tablet|ipad|playbook|silk/.test(userAgent)) {
            return 'Tablet';
        } else if (/mobi|android|iphone|ipod/.test(userAgent)) {
            return 'Mobile';
        } else {
            return 'Desktop';
        }
    }

    function getUserPreferredLanguage() {
        return navigator.language || navigator.userLanguage;
    }

    let publicIp
    await fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            publicIp = data.ip
            
        })
        .catch(error => console.error('Error fetching IP:', error));

    // Get the publisher ID from the script URL
    const { publisherID, websiteID } = getIDsFromScript();
    const deviceType = getDeviceType()
    const userLanguage = getUserPreferredLanguage()
    if (!publisherID) {
        console.error('Publisher ID not found');
        return;
    }

    const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.right = '1px';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';
        closeButton.style.zIndex = '10';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://ad-management-ad-management-api.t0llnh.easypanel.host/admin/getad?publisher_id=${publisherID}&publicIp=${publicIp}&deviceType=${deviceType}&website_id=${websiteID}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const adContent = JSON.parse(xhr.responseText);
            const adElements = document.getElementsByClassName(`${adContent.ad.ad_position}`);
            if (adElements.length === 0) 
                return;
            const adElement = adElements[0];
                adElement.style.position = 'relative'; 
            adElement.appendChild(closeButton);
            if (adContent.ad.file_path.endsWith('.mp4')) {
                adElement.insertAdjacentHTML('beforeend', `
                    <a href="https://ad-management-ad-management-api.t0llnh.easypanel.host/admin/trackclick?adId=${adContent.ad.ad_id}&publisherId=${publisherID}&website_id=${websiteID}publicIp=${publicIp}" target="_blank">
                        <video width="100%" height="100%" autoplay muted loop>
                            <source src="${adContent.ad.file_path}" type="video/mp4">
                        </video>
                    </a>
                `);
            } else {
                adElement.insertAdjacentHTML('beforeend', `
                    <a href="https://ad-management-ad-management-api.t0llnh.easypanel.host/admin/trackclick?adId=${adContent.ad.ad_id}&publisherId=${publisherID}&website_id=${websiteID}publicIp=${publicIp}" target="_blank">
                        <img src="${adContent.ad.file_path}" alt="Ad" style="width:100%; height:100%;"/>
                    </a>
                `);
            }
            closeButton.addEventListener('click', function() {
                adElement.innerHTML = '';  
            });
        }
    };
    xhr.send();
})();
