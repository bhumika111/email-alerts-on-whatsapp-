const imaps = require('imap-simple');

exports.handler = async function(context, event, callback) {
  const timeout = setTimeout(() => {
  twiml.message("Email server is taking too long to respond. Try again in a minute.");
  return callback(null, twiml);
}, 8000);  
  const twiml = new Twilio.twiml.MessagingResponse();
  
  if (!event.Body || event.Body.toLowerCase().trim() !== 'check') {
      twiml.message("Send 'check' to read emails.");
      clearTimeout(timeout);
      return callback(null, twiml);
  }

  const config = {
    imap: {
      user: context.EMAIL_USER,      
      password: context.EMAIL_PASSWORD, 
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 5000
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');
    
    const searchCriteria = [
  'UNSEEN',
  ['SINCE', new Date()]
];
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM SUBJECT)'], struct: true, markSeen: false };
    
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    if (messages.length === 0) {
        twiml.message("No new emails.");
    } else {
        // Limit to last 5 emails to fit in one WhatsApp message
        const recent = messages.slice(-5).reverse();
        let reply = `Found ${messages.length} unread. Latest:\n`;
        
        recent.forEach(msg => {
            const header = msg.parts.find(p => p.which === 'HEADER.FIELDS (FROM SUBJECT)');
            if(header && header.body) {
                reply += `\n- From: ${header.body.from[0]}`;
                reply += `\n  Sub: ${header.body.subject[0]}\n`;
            }
        });
        // Trim to 1600 chars for WhatsApp limit
        twiml.message(reply.substring(0, 1599));
    }
    
    connection.end();
    clearTimeout(timeout);
    return callback(null, twiml);

  } catch (err) {
    console.error(err);
    twiml.message("Error fetching emails: " + err.message);
    clearTimeout(timeout);
    return callback(null, twiml);
  }
};