/**
 * Welcome to your new BasedAKP48 connector, "<%= moduleName %>"! Let's get started!
 */
// firebase-admin is what allows us to connect to the Firebase database.
const admin = require('firebase-admin');
// inquirer allows us to prompt for information if needed
const inquirer = require('inquirer');
// plugin-utils give us access to useful functions
const utils = require('@basedakp48/plugin-utils');
// presence allows us to register our "presence" to the database, with functions for us to use.
const presence = new utils.PresenceSystem();
// Load our pakage data, for use in presence
const pkg = require('./package.json');

/**
 * A serviceAccount.json file is required to connect.
 * You can retrieve your serviceAccount.json file from the Firebase web interface.
 */
const serviceAccount = require("./serviceAccount.json");

// Initialize the Firebase app.
utils.initialize(admin, serviceAccount);

const rootRef = admin.database().ref();
const cid = utils.getCID(rootRef, __dirname);
let connection;

// Initialize presence
presence.initialize({
  rootRef, cid, pkg,
  listenMode: 'connector',
});

// Load and update configuration.
rootRef.child(`config/clients/${cid}`).on('value', (d) => {
  let config = d.val();

  // Prompt for token if missing
  if(!config || !d.hasChild('token')) {
    return prompt(d.ref);
  }
  
  // Handle changes in configuration
  if (connection) {
    // Token, Display name, status, etc...
  }
  
  // Create a connection if needed
  setupConnection();
});

// Listen for messages to send
rootRef.child(`clients/${cid}`).on('child_added', (d) => {
  // If we don't have an active connection, we need to delete the message (or it will remain stale)
  if (!connection) return d.ref.remove();

  let msg = d.val();
  if (msg.type.toLowerCase() === 'text') {
    // Send an outgoing message via connection
    // connection.sendMessage(msg.text);
    
    // Remove message from the queue
    d.ref.remove();
  }
});

function setupConnection() {
  if (connection) return;
  
  // Create your connection
  // connection = new yourConnection();
  
  // And more connection setup
}

// This is called by handleMessage
function isOur(msg) {
  return 'TODO: change me';
}

// This gets called by your connection
function handleMessage(msg) {
  if (isOur(msg)) return;
  let incomingMessage = {
    cid: cid,
    uid: 'TODO: Change me',
    text: 'TODO: Change me',
    channel: 'TODO: Change me',
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
