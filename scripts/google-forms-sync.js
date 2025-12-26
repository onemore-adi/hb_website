/**
 * Google Apps Script for HeartBeats Google Forms → Firebase Sync
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Form
 * 2. Click the 3-dot menu → Script editor
 * 3. Paste this entire code
 * 4. Replace FIREBASE_PROJECT_ID and FIREBASE_API_KEY with your values
 * 5. Click Run → onFormSubmit to authorize
 * 6. Set up trigger: Edit → Current project's triggers → Add Trigger
 *    - Function: onFormSubmit
 *    - Event type: On form submit
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const FIREBASE_PROJECT_ID = 'YOUR_PROJECT_ID'; // e.g., 'heartbeats-web'
const FIREBASE_API_KEY = 'YOUR_FIREBASE_WEB_API_KEY'; // From Firebase Console → Project Settings → Web API Key

// Map your Google Form questions to field names
// Update these based on your actual form questions
const FIELD_MAPPING = {
    'Name': 'name',
    'Roll Number': 'rollNo',
    'Email Address': 'email',
    'Field to Apply': 'field',
    'Other Field (if selected Other)': 'otherField',
    'Department': 'department',
    'Year': 'year',
    'Past Performance Link': 'performanceLink',
    'Why HeartBeats?': 'message',
};

// ============================================
// MAIN FUNCTION - DO NOT MODIFY
// ============================================
function onFormSubmit(e) {
    try {
        const formResponse = e.response;
        const itemResponses = formResponse.getItemResponses();

        // Build application data
        const applicationData = {
            status: 'pending',
            source: 'google_forms',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Map form responses to fields
        itemResponses.forEach(response => {
            const question = response.getItem().getTitle();
            const answer = response.getResponse();

            // Check if this question is in our mapping
            for (const [formQuestion, fieldName] of Object.entries(FIELD_MAPPING)) {
                if (question.includes(formQuestion) || formQuestion.includes(question)) {
                    applicationData[fieldName] = answer || '';
                    break;
                }
            }
        });

        // Get email from respondent if available
        if (!applicationData.email) {
            applicationData.email = formResponse.getRespondentEmail() || '';
        }

        // Validate required fields
        if (!applicationData.rollNo || !applicationData.email || !applicationData.name || !applicationData.field) {
            console.error('Missing required fields', applicationData);
            return;
        }

        // Use rollNo as document ID for easy lookup and deduplication
        const documentId = applicationData.rollNo.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Send to Firebase
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/applications/${documentId}?key=${FIREBASE_API_KEY}`;

        const firestoreData = {
            fields: {
                rollNo: { stringValue: applicationData.rollNo },
                email: { stringValue: applicationData.email },
                name: { stringValue: applicationData.name },
                field: { stringValue: applicationData.field },
                otherField: { stringValue: applicationData.otherField || '' },
                department: { stringValue: applicationData.department || '' },
                year: { stringValue: applicationData.year || '' },
                performanceLink: { stringValue: applicationData.performanceLink || '' },
                message: { stringValue: applicationData.message || '' },
                status: { stringValue: 'pending' },
                source: { stringValue: 'google_forms' },
                submittedAt: { timestampValue: new Date().toISOString() },
                updatedAt: { timestampValue: new Date().toISOString() },
            }
        };

        const options = {
            method: 'PATCH', // PATCH to create or update
            contentType: 'application/json',
            payload: JSON.stringify(firestoreData),
            muteHttpExceptions: true,
        };

        const response = UrlFetchApp.fetch(firestoreUrl, options);
        const responseCode = response.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            console.log('Successfully synced application for:', applicationData.rollNo);
        } else {
            console.error('Firebase error:', response.getContentText());
        }

    } catch (error) {
        console.error('Error syncing form submission:', error);
    }
}

// Test function - run manually to verify setup
function testConnection() {
    const testUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents?key=${FIREBASE_API_KEY}`;

    try {
        const response = UrlFetchApp.fetch(testUrl, { muteHttpExceptions: true });
        const code = response.getResponseCode();

        if (code === 200) {
            console.log('✓ Connection successful! Firebase project is accessible.');
        } else {
            console.error('✗ Connection failed. Response code:', code);
            console.error(response.getContentText());
        }
    } catch (error) {
        console.error('✗ Connection error:', error);
    }
}
