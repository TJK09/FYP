import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../styles/pages/Home.css';
import img from '../assets/1.webp';
import img2 from '../assets/patient-rooms-1.jpg';
import img3 from  '../assets/3.jpeg';
import img4 from '../assets/DA.jpg';
import img5 from '../assets/DB.jpg';
import img6 from '../assets/DC.jpg';
import img7 from '../assets/DD.jpg';
import img8 from '../assets/DE.jpg';
import img12 from '../assets/DF.jpg';
import { Link } from 'react-router-dom';
import img9 from '../assets/appoint.webp';
import img10 from '../assets/lab.jfif.jpg';
import img11 from '../assets/Medical.jfif.jpg';
import dep from '../assets/dep.jfif.jpg';

const Home = () => {
  const images = [
    { src: img, caption: 'Providing Quality Healthcare Services' },
    { src: img2, caption: 'Your Health, Our Priority' },
    { src: img3, caption: 'Trusted by Thousands of Patients' },
  ];

  const doctors = [
    { id: 24, name: 'Dr. Taj Khan', specialty: 'Cardiologist', image: img4 },
    { id: 25, name: 'Dr. Muhammad Rehman', specialty: 'Dermatologist', image: img5 },
    { id: 26, name: 'Dr. Mehmood Ul Hassan', specialty: 'Neurologist', image: img6 },
    { id: 27, name: 'Dr. Anwar Khan', specialty: 'Orthopedic', image: img7 },
    { id: 28, name: 'Dr. Fatima Zahid', specialty: 'Psychiatrist', image: img12 },
    { id: 29, name: 'Dr. Ali Raza', specialty: 'Medical Specialist', image: img8 },
  ];

  const faqs = [
    {
      question: 'How can I book an appointment?',
      answer: 'You can book an appointment through our website or by calling our helpline. Or simply go to the appointment booking section and there add your credentials and book an appointment',
    },
    { question: 'Do you offer home services?', answer: 'Yes, we provide home services for certain medical needs.' },
    { question: 'Are lab tests available?', answer: 'We offer a wide range of lab tests with quick results.' },
    { question: 'Can we book an appointment without loggin in?', answer: 'No, for that you have to Signup or Signin, to get your information' },
  ];

  return (
    <div className='home-container'>

      {/* Image Slider */}
      <section className='home-slider'>
        <Carousel autoPlay infiniteLoop showThumbs={false}>
          {images.map((item, index) => (
            <div key={index}>
              <img src={item.src} alt={`Slide ${index + 1}`} className="slider-img" />
              <p className="legend">{item.caption}</p>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="container text-center">
          <h2 className="section-title">Our Services</h2>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="custom-card">
                <img src={img9} alt="Card-Img" className="card-img" />
                <div className="card-body">
                  <h5 className="card-title">Appointment Booking</h5>
                  <p>Now you can book your doctor appointments with a click.</p>
                  <Link to="appointment" className='btn-custom primary'>Book your Appointment</Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="custom-card">
                <img src={img10} alt="Card-Img" className="card-img" />
                <div className="card-body">
                  <h5 className="card-title">Lab & Diagnostic</h5>
                  <p>Fully Equipped Labs for routine and specialized diagnostics.</p>
                  <Link to="/lab-test" className='btn-custom primary'>Conduct Lab Tests</Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="custom-card">
                <img src={dep} alt="Card-Img" className="card-img" />
                <div className="card-body">
                  <h5 className="card-title">AI based Depression Analysis</h5>
                  <p>AI powered algorithms to analyze depression conditions effectively.</p>
                  <Link to="/Depression" className='btn-custom primary'>Depression Check</Link>
                </div> 
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="custom-card">
                <img src={img11} alt="Card-Img" className="card-img" />
                <div className="card-body">
                  <h5 className="card-title">Medical Records</h5>
                  <p>Access your medical history digitally, no need for physical files.</p>
                  <Link to="/medical-records" className='btn-custom primary'>Medical Records</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="home-doctors">
        <div className="container">
          <h2 className="section-title text-center">Our Doctors</h2>
          <div className="row">
            {doctors.map((doc, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="doctor-card">
                  <img src={doc.image} alt={doc.name} className="doctor-img" />
                  <div className="card-body">
                    <h5>{doc.name}</h5>
                    <p>{doc.specialty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover */}
      <section className="discover-section">
        <div className="container text-center">
          <h2 className="section-title">Discover our Hospital</h2>
          <div className="row align-items-center">
            <div className="col-md-12 mb-4 mb-md-0">
              <img src={img} alt="Disover" className='discover-img' />
            </div>
            <div className="col-md-12">
              <p>We are committed to delivering world-class healthcare services with state-of-the-art facilities, qualified staff, and compassionate care.</p>
              <Link to="/About-Us" className="btn-custom secondary">Discover More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="news-section">
        <div className="container text-center">
          <h2 className="section-title">News & Events</h2>
          <div className='row'>
            <div className="col-md-6 mb-4">
              <div className="custom-card">
                <img src={img3} alt="News 1" className="card-img" />
                <div className="card-body">
                  <h5>How our Depression System works</h5>
                  <p>Our AI system uses psychiatrist-designed questionnaires to detect depression levels.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="custom-card">
                <img src={img2} alt="News-2" className="card-img" />
                <div className="card-body">
                  <h5>Free Health Camp</h5>
                  <p>We are organizing a free health camp for medical checkups. Visit to schedule free consultations with our volunteers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="home-faqs">
        <div className="container">
          <h2 className="section-title text-center">Frequently Asked Questions</h2>
          <div className="row">
            {faqs.map((faq, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="faq-card">
                  <h5>{faq.question}</h5>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
