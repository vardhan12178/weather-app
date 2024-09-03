import sunny from '../assets/images/sunny.png'
import cloudy from '../assets/images/cloudy.png'
import rainy from '../assets/images/rainy.png'
import snowy from '../assets/images/snowy.png'
import loadingGif from '../assets/images/loading.gif'
import { useState, useEffect } from 'react'

const WeatherApp = () => {
  const [data, setData] = useState({})
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const api_key = process.env.REACT_APP_API_KEY
  console.log('API Key:', process.env.REACT_APP_API_KEY)


  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      setLoading(true)
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=Metric&appid=${api_key}`
        const res = await fetch(url)
        const weatherData = await res.json()
        if (weatherData.cod === 200) {
          setData(weatherData)
        } else {
          setData({ notFound: true })
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const handleGeolocation = (position) => {
      const { latitude, longitude } = position.coords
      fetchWeather(latitude, longitude)
    }

    const handleError = (error) => {
      setError(error.message)
      setLoading(false)
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleGeolocation, handleError)
    } else {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
    }
  }, [api_key])

  const handleInputChange = (e) => {
    setLocation(e.target.value)
  }

  const search = async () => {
    if (location.trim() !== '') {
      setLoading(true)
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=Metric&appid=${api_key}`
        const res = await fetch(url)
        const searchData = await res.json()
        if (searchData.cod === 200) {
          setData(searchData)
          setLocation('')
        } else {
          setData({ notFound: true })
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search()
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.')
      return
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onspeechend = () => {
      setIsListening(false)
      recognition.stop()
    }

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      setLocation(speechResult)
      search()
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      setError('Speech recognition error: ' + event.error)
    }

    recognition.start()
  }

  const weatherImages = {
    Clear: sunny,
    Clouds: cloudy,
    Rain: rainy,
    Drizzle: rainy,
    Snow: snowy,
    Haze: cloudy,
    Mist: cloudy,
  }

  const weatherImage = data.weather ? weatherImages[data.weather[0].main] : null

  const backgroundImages = {
    Clear: 'linear-gradient(to right, #f3b07c, #fcd283)',
    Clouds: 'linear-gradient(to right, #57d6d4, #71eeec)',
    Rain: 'linear-gradient(to right, #5bc8fb, #80eaff)',
    Snow: 'linear-gradient(to right, #aff2ff, #fff)',
    Haze: 'linear-gradient(to right, #57d6d4, #71eeec)',
    Mist: 'linear-gradient(to right, #57d6d4, #71eeec)',
  }

  const backgroundImage = data.weather
    ? backgroundImages[data.weather[0].main]
    : 'linear-gradient(to right, #f3b07c, #fcd283)'

  const currentDate = new Date()

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const dayOfWeek = daysOfWeek[currentDate.getDay()]
  const month = months[currentDate.getMonth()]
  const dayOfMonth = currentDate.getDate()

  const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month}`

  return (
    <div className="container" style={{ backgroundImage }}>
      <div
        className="weather-app"
        style={{
          backgroundImage:
            backgroundImage && backgroundImage.replace
              ? backgroundImage.replace('to right', 'to top')
              : null,
        }}
      >
        <div className="search">
          <div className="search-top">
            <i className="fa-solid fa-location-dot"></i>
            <div className="location">{data.name}</div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter Location"
              value={location}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
           
            <i
              className={`fa-solid fa-microphone ${isListening ? 'listening' : ''}`}
              onClick={startListening}
            ></i>
          </div>
        </div>
        {loading ? (
          <img className="loader" src={loadingGif} alt="loading" />
        ) : error ? (
          <div className="not-found">{error}</div>
        ) : data.notFound ? (
          <div className="not-found">Not Found 😒</div>
        ) : (
          <>
            <div className="weather">
              <img src={weatherImage} alt={data.weather ? data.weather[0].main : 'weather'} />
              <div className="weather-type">{data.weather ? data.weather[0].main : null}</div>
              <div className="temp">{data.main ? `${Math.floor(data.main.temp)}°` : null}</div>
            </div>
            <div className="weather-date">
              <p>{formattedDate}</p>
            </div>
            <div className="weather-data">
              <div className="humidity">
                <div className="data-name">Humidity</div>
                <i className="fa-solid fa-droplet"></i>
                <div className="data">{data.main ? data.main.humidity : null}%</div>
              </div>
              <div className="wind">
                <div className="data-name">Wind</div>
                <i className="fa-solid fa-wind"></i>
                <div className="data">{data.wind ? data.wind.speed : null} km/h</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WeatherApp
