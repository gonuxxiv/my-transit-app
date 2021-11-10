import { Form, Input, TextArea, Button } from 'semantic-ui-react';
import './ContactUs.css';
import React from 'react';
import emailjs from 'emailjs-com';
import Swal from 'sweetalert2';
import bgImg from "../images/bus-stop-vector.jpg";


const SERVICE_ID = process.env.REACT_APP_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_TEMPLATE_ID;
const USER_ID = process.env.REACT_APP_USER_ID;

const ContactForm = () => {
  const handleOnSubmit = (e) => {
    e.preventDefault();
    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, e.target, USER_ID)
      .then((result) => {
        console.log(result.text);
        Swal.fire({
          icon: 'success',
          title: 'Message Sent Successfully'
        })
      }, (error) => {
        console.log(error.text);
        Swal.fire({
          icon: 'error',
          title: 'Oops, something went wrong',
          text: error.text,
        })
      });
    e.target.reset()
  };

  return (
    <div id="main-wrapper" style={{
      background: `linear-gradient(rgba(255,255,255,.3), rgba(255,255,255,.1)), url(${bgImg})`, 
      backgroundSize: "cover", 
      zIndex: -1,
      height: "96vh"
      }}>
      <p id="prompt">Tell Us About Your Experience🌟</p>
      <div className="form-wrapper">
        <Form id="form" onSubmit={handleOnSubmit}>
          <Form.Field
            id='form-input-control-email'
            control={Input}
            label='Email'
            name='from_email'
            placeholder='Email…'
            required
            icon='mail'
            iconPosition='left'
          />
          <Form.Field
            id='form-input-control-last-name'
            control={Input}
            label='Name'
            name='from_name'
            placeholder='Name…'
            required
            icon='user circle'
            iconPosition='left'
          />
          <Form.Field
            id='form-textarea-control-opinion'
            control={TextArea}
            label='Message'
            name='message'
            placeholder='Message…'
            required
          />
          <Button id="submit" type='submit' color='green'>Submit</Button>
        </Form>
      </div>
    </div>
  );
}

export default ContactForm;
