
document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view-detailed').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function view_mail(id) {
  console.log("read", id);
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view-detailed').style.display = 'block';

      document.querySelector('#emails-view-detailed').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
        <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
        <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
        <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp}</li>
        <p class="my-3">${email.body}</p>
      </ul>
      `

      //  read 
      if (!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      // archive button
      const btn = document.createElement('button');
      btn.innerHTML = email.archived ? "Unarchive" : "Archive";
      btn.className = email.archived ? "btn btn-success" : "btn btn-danger";
      btn.addEventListener('click', function () {
        console.log('This element has been clicked!')
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
          .then(() => { load_mailbox('archive') })
      });
      document.querySelector('#emails-view-detailed').append(btn);

      // reply btn
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply";
      btn_reply.className = "btn btn-primary mx-3";
      btn_reply.addEventListener('click', function () {
        console.log('You are going to Reply this mail');
        compose_email()

        document.querySelector('#compose-recipients').value = email.sender;
        let sub = email.subject
        if (sub.split(' ', 1)[0] != "RE:") {
          sub = "RE: " + email.subject
        }
        document.querySelector('#compose-subject').value = sub;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} Wrote:${email.body}`;
      })
      document.querySelector('#emails-view-detailed').append(btn_reply);

      // ... do something else with email ...
    });
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view-detailed').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // emails for mailbox and user
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      // looping emails
      emails.forEach(mail => {

        console.log(mail)

        const new_email = document.createElement('div');
        new_email.className = 'list-group-item list-group-item-dark table'
        new_email.innerHTML =`
        <tr>
        <strong><th class="w-25">${mail.sender}</th></strong>
        <h class="mx-50%"><th class="w-50">${mail.subject}</th></h>
        <strong><th class="w-25">${mail.timestamp}</th></strong>
        </tr>`

        // read or unread
        new_email.className = mail.read ? 'list-group-item list-group-item-dark table' : 'list-group-item list-group-item-success table';
        new_email.addEventListener('click', function () {
          view_mail(mail.id);
        });
        document.querySelector('#emails-view').append(new_email);
      });
    });
}


function send_email(event) {
  event.preventDefault();

  // Storing fields in variables
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //send data to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });
}
