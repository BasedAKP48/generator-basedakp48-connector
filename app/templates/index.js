/**
 * Welcome to your new BasedAKP48 connector, "<%= moduleName %>"! Let's get started!
 */

// firebase-admin is what allows us to connect to the Firebase database.
const admin = require('firebase-admin');

/**
 * A serviceAccount.json file is required to connect.
 * You can retrieve your serviceAccount.json file from the Firebase web interface.
 */
const serviceAccount = require("./serviceAccount.json");

// Initialize the Firebase app. Change the URL below if you're using another Firebase database.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const rootRef = admin.database().ref();
let cid, connection;

try {
  cid = require('./cid.json');
} catch (e) {
  let fs = require('fs');
  let clientRef = rootRef.child('config/clients').push();
  cid = clientRef.key;
  fs.writeFileSync('./cid.json', JSON.stringify(cid), {encoding: 'UTF-8'});
}

rootRef.child(`config/clients/${cid}`).on('value', (d) => {
  let config = d.val();

  // Prompt for token if missing
  if(!config || !d.hasChild('token')) {
    prompt(d.ref);
    return;
  }
  
  // Handle changes in configuration
  if (connection) {
    // Token, Display name, status, etc...
  }
  
  // Create a connection if needed
  setupConnection();
}

function setupConnection() {
  if (connection) return;
  
  // Create your connection
  // connection = new yourConnection();
  
  // And more connection setup
  
  // Listen for outgoing messages
  rootRef.child(`clients/${cid}`).on('child_added', (d) => {
    let msg = d.val();
    if (msg.msgType.toLowerCase() === 'chatmessage') {
      // Send an outgoing message via connection
      // connection.sendMessage(msg.text);
      
      // Remove message from the queue
      d.ref.remove();
    }
  };
}

// This is called by handleMessage
function isOur(msg) {
  // !!! Be sure to change this
  return true;
}

// This gets called by your connection
function handleMessage(msg) {
  if (isOur(msg)) return;
  let incomingMessage = {
    cid: cid,
    uid: '!!! Change me',
    text: '!!! Change me',
    channel: '!!! Change me',
    msgType: 'chatMessage',
    timeReceived: msg.timestamp || Date.now()
  };
  
  rootRef.child('pendingMessages').push(incomingMessage)
}

// This is called when needing to provide a token
function prompt(ref) {
  inquirer.prompt([{name: 'token', message: "Enter your bot's token:"}]).then(prompt => {
    if (prompt.token) {
      ref.update({token: prompt.token});
    }
  });
}
