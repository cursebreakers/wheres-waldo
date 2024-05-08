// User ID generator - usermod.js

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return null;
    }
}

async function getUserLocation(ipAddress) {
    try {
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        const data = await response.json();
        return {
            city: data.city,
            region: data.region,
            country: data.country,
            latitude: data.latitude,
            longitude: data.longitude
        };
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
}

export async function getUserData() {

    const ipAddress = await getUserIP()
    const userLoc = await getUserLocation(ipAddress)
    
    const userAgent = navigator.userAgent;

    const timestamp = new Date().toISOString().replace(/[^\w\s]/gi, '').replace(/\s/g, '-');

    const fingerprint = `${userAgent}:${userLoc.city}@${ipAddress}${timestamp}UDT`;
    
    console.log('Fingerprint:', fingerprint)
    return fingerprint
}


export async function saveHighScore(username, elapsedTime) {
    try {
        const fingerprint = await getUserData();

        const SCORE_API = '/roster'

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fingerprint,
                username,
                elapsedTime,
            })
        };
     
        const response = await fetch(SCORE_API, requestOptions);
        const data = await response.json();

        console.log('High score saved', fingerprint, username, elapsedTime )

    } catch (error) {
      console.error('Error saving high score:', error);
    }

}
