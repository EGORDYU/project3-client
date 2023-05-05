import {Link} from "react-router-dom"
import CardForm from "../partials/CardForm";
import {useState, useEffect} from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from 'axios';
import { CloudinaryContext } from 'cloudinary-react';


export default function Deck(){
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [image, setImage] = useState('');

  const {id} = useParams()
  const navigate = useNavigate();

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        navigate('/login'); // Redirect user to login page if no token found
      } else {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api-v1/decks/${id}`, {
          headers: {
            'Authorization': token
          }
        });
        console.log(`this is the setCards response data`,response.data);
        setCards(response.data.flashcards);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCards();
  },[]);

  const deleteFlashcard = async (id) => {
    const token = localStorage.getItem('jwt');
    console.log(token)
  
    if (!token) {
      navigate('/login'); // Redirect user to login page if no token found
    }
  
    try {
      const url = `${process.env.REACT_APP_SERVER_URL}/api-v1/flashcards/${id}`;
      console.log(`Deleting flashcard at URL: ${url}`);
      const response = await axios.delete(url, {
        headers: {
          'Authorization': token
        }
      });
      console.log(`DELETE response status: ${response.status}`);
      console.log(`DELETE response data: ${JSON.stringify(response.data)}`);
    } catch (err) {
      console.log(`Error deleting flashcard: ${err.message}`);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('jwt');
  
    if (!token) {
      navigate('/login');
      return;
    }
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api-v1/decks/${id}/flashcards`,
        {
          front,
          back,
          image,
          deckId: id,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Upload-Preset': process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
            'X-API-Key': process.env.REACT_APP_CLOUDINARY_API_KEY,
          },
        }
      );
      console.log(`POST response status: ${response.status}`);
      console.log(image)
      console.log(`response data 2023`,response.data)
      console.log(`POST response data: ${JSON.stringify(response.data)}`);
      setFront('');
      setBack('');
      setImage('');
      fetchCards();
    } catch (err) {
      console.log(`Error adding flashcard: ${err.message}`);
    }
  };
  
  
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onloadend = () => {
      setImage(reader.result);
    };
  
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  
  const flashCard = cards.map((card) => (

    <div
      className="flashcard-container"
      key={card._id}
      style={
        card.image
          ? {
              backgroundImage: `url(${card.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <p className="flashcard-container-p flashcard-container-front">
        Front: {card.front}
      </p>
      <p className="flashcard-container-back flashcard-container-show-back-back">
        Back: {card.back}
      </p>
      <button
        className="delete-button"
        onClick={() => deleteFlashcard(card._id)}
      >
        Delete
      </button>
    </div>
  ));
  
  
  
  
  

  return (
    <>
    
    <form onSubmit={handleSubmit}>
  <label>
    Front:
    <input type="text" value={front} onChange={(e) => setFront(e.target.value)} />
  </label>
  <br />
  <label>
    Back:
    <input type="text" value={back} onChange={(e) => setBack(e.target.value)} />
  </label>
  <br />
  <label>
    Image:
    <input type="file" onChange={handleImageUpload} />
  </label>
  <br />
  <button type="submit">Add Flashcard</button>
</form>

<CloudinaryContext cloudName={process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}>
      {flashCard}
      </CloudinaryContext>
    </>
  );
}
