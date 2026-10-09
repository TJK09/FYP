import React from "react";

function Option() {
  const quotes = [
    {
      id: 1,
      text: "“It is health that is real wealth and not pieces of gold and silver.”",
      author: "Mahatma Gandhi",
    },
    {
      id: 2,
      text: "“Take care of your body. It’s the only place you have to live.”",
      author: "Jim Rohn",
    },
    {
      id: 3,
      text: "“Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.”",
      author: "Buddha",
    },
  ];

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 text-white">Health Quotes</h2>
      <div className="row g-4 justify-content-center">
        {quotes.map(({ id, text, author }) => (
          <div key={id} className="col-md-4">
            <div className="card text-center bg-dark text-white p-4" style={{ minHeight: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p className="card-text fst-italic" style={{ fontSize: '1.2rem' }}>{text}</p>
              <footer className="blockquote-footer text-white mt-3">{author}</footer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Option;
