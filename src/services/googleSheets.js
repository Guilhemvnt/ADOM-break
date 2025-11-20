export const uploadGameStats = async (data) => {
    const scriptUrl = localStorage.getItem('darts_sheet_url');

    if (!scriptUrl) {
        console.warn('No Google Sheet URL configured.');
        throw new Error('MISSING_URL');
    }

    if (!data.authToken) {
        console.warn('No Auth Token provided.');
        // We don't throw here to allow unauthenticated uploads if the script allows it (backward compatibility),
        // but for this specific task, the script WILL reject it.
    }

    try {
        // We use no-cors mode because Google Apps Script redirects.
        // This means we can't read the response, but it allows the POST to succeed.
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Request sent to Google Sheets');
    } catch (error) {
        console.error('Error uploading to Google Sheets:', error);
        throw error;
    }
};
