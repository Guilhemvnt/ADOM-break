import React, { useState, useEffect } from 'react';
import { uploadGameStats } from '../services/googleSheets';

function Settings({ onClose }) {
    const [scriptUrl, setScriptUrl] = useState('');
    const [clientId, setClientId] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // 'testing', 'success', 'error'

    useEffect(() => {
        const savedUrl = localStorage.getItem('darts_sheet_url');
        if (savedUrl) {
            setScriptUrl(savedUrl);
        }
        const savedClientId = localStorage.getItem('darts_google_client_id');
        if (savedClientId) {
            setClientId(savedClientId);
        }
    }, []);

    const handleSave = () => {
        if (scriptUrl.includes('docs.google.com/spreadsheets')) {
            alert('⚠️ It looks like you pasted the Spreadsheet URL.\n\nPlease follow the setup instructions to deploy the Apps Script and get the "Web App URL" (it usually starts with script.google.com).');
            return;
        }

        localStorage.setItem('darts_sheet_url', scriptUrl);
        localStorage.setItem('darts_google_client_id', clientId);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);

        // Reload to apply new Client ID if changed (simplest way to update AuthProvider)
        if (clientId !== localStorage.getItem('darts_google_client_id')) {
            window.location.reload();
        }
    };

    const handleTest = async () => {
        if (!scriptUrl) return;

        // Save first just in case
        localStorage.setItem('darts_sheet_url', scriptUrl);

        setTestStatus('testing');
        try {
            await uploadGameStats({
                date: new Date().toISOString(),
                winner: 'TEST_USER',
                target: 0,
                players: 'TEST_PLAYER',
                dartsThrown: 0
            });
            setTestStatus('success');
            setTimeout(() => setTestStatus(null), 3000);
        } catch (e) {
            console.error(e);
            setTestStatus('error');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>

                <h2 style={{ color: 'var(--accent-gold)', marginBottom: '20px' }}>⚙️ Settings</h2>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Google Apps Script URL
                    </label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        To save stats to your Google Sheet, you need to deploy the Apps Script as a Web App.
                        <br />
                        <a
                            href="https://github.com/Guilhemvnt/ADOM-break/blob/main/GOOGLE_SHEETS_SETUP.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-green)' }}
                        >
                            View Setup Instructions
                        </a>
                    </p>
                    <input
                        type="text"
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            marginBottom: '10px'
                        }}
                    />
                    {scriptUrl.includes('/a/macros/') && (
                        <div style={{
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            border: '1px solid var(--accent-red)',
                            borderRadius: '4px',
                            padding: '10px',
                            marginBottom: '10px',
                            fontSize: '0.85rem',
                            color: 'var(--accent-red)'
                        }}>
                            ⚠️ <strong>Potential Issue Detected</strong><br />
                            Your URL contains <code>/a/macros/</code>, which means it's hosted on a Work/School account.<br />
                            These accounts often block external access (Error 401).<br />
                            <strong>Recommendation:</strong> Host the script on a personal Gmail account instead.
                        </div>
                    )}

                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', marginTop: '15px' }}>
                        Google Client ID
                    </label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Required for organization login.
                    </p>
                    <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="123456789-abc...apps.googleusercontent.com"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            marginBottom: '10px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        onClick={handleTest}
                        className="btn"
                        style={{
                            backgroundColor: testStatus === 'success' ? 'var(--accent-green)' :
                                testStatus === 'error' ? 'var(--accent-red)' :
                                    'var(--bg-primary)',
                            color: testStatus === 'success' || testStatus === 'error' ? '#fff' : 'var(--text-primary)',
                            border: testStatus === 'success' || testStatus === 'error' ? 'none' : '1px solid var(--border-color)',
                            animation: testStatus === 'error' ? 'shake 0.4s ease-in-out' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                        disabled={!scriptUrl || testStatus === 'testing'}
                    >
                        {testStatus === 'testing' ? '⏳ Testing...' :
                            testStatus === 'success' ? '✓ Connection Successful!' :
                                testStatus === 'error' ? '❌ Connection Failed' : 'Test Connection'}
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                    >
                        {isSaved ? '✓ Saved!' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
