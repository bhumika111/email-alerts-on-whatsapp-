const imaps = require('imap-simple');

const config = {
    imap: {
        user: 'bhumikaramawat111@gmail.com', 
        password: 'zdde xjej nqmq jcjd',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000
    }
};

async function fetchEmails() {
    try {
        console.log("Connecting to Gmail...");
        const connection = await imaps.connect(config);
        console.log("Connected! Opening Inbox...");
        
        await connection.openBox('INBOX');
        
        const searchCriteria = ['UNSEEN']; // Search for unread emails
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM SUBJECT)'],
            struct: true,
            markSeen: false 
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        
        console.log(`Found ${messages.length} unread emails.`);
        
        // Print the subjects of the last 3 emails
        messages.slice(-3).forEach(item => {
            const header = item.parts.find(p => p.which === 'HEADER.FIELDS (FROM SUBJECT)');
            console.log("-------------------------");
            console.log("From:", header.body.from[0]);
            console.log("Subject:", header.body.subject[0]);
        });

        connection.end();
    } catch (error) {
        console.log("Error:", error);
    }
}

fetchEmails();
