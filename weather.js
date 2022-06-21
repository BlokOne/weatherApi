const root = document.getElementById("root");
const textInput = document.getElementById('text-input')
const popup = document.getElementById("popup");
const formSubmit = document.getElementById("form");
const close = document.getElementById('close');


let store = {
   city: "Москва",
   feelslike: 0,
   timezone: 0,
   description: "",
   name:"",
   properties: {
      humidity: 0,
      cloudcover: 0,
      temperature:0,
      windSpeed: 0,
      pressure: 0,
      sunrise: 0 ,
      sunset:  0,
      visibility:0,
      temMax:0,
      temMin:0,
   }
}

const fetchData = async () => {
   try {
      const query = localStorage.getItem('query') || store.city;
      const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=f02188b4bf768b68f9ed9c0e850da0e1&units=metric&lang=ru`);
      const data = await result.json();
      console.log(data)
      const timeNow = correctTime(data.timezone);
      const { 
         timezone,
         visibility,
         name,
         main: {
            feels_like:feelslike,
            temp:temperature,
            humidity,
            pressure,
            temp_max:temMax,
            temp_min:temMin,
         },
         clouds: {
            all:cloudcover
         },
         sys: {
            sunrise,
            sunset
         },
         weather: {
            0: {
               description
            }
         },
         wind: {
            speed:windSpeed
         },
      } = data; 
         temp = Math.round(temperature);
         tempMax = Math.round(temMax);
         tempMin = Math.round(temMin);
      store = {
         ...store,
         feelslike,
         temp,
         humidity,
         timeNow,
         description,
         temperature,
         properties: {
            humidity: {
               title: "Влажность",
               value: `${humidity}%`,
               icon: "humidity.png"
               },
            cloudcover: {
               title: "Облачность",
               value: `${cloudcover}%`,
               icon: "cloud.png",
               },
            windSpeed: {
               title: "Скорость ветра",
               value: `${windSpeed}m/s`,
               icon: "wind.png",
               },
            pressure : {
               title: "Давление",
               value: `${pressure}гПа`,
               icon: "gauge.png",
               },
            tempMax: {
               title: "Максимум",
               value: `${tempMax}`,
               icon: "hot.png",
               },
            tempMin: {
               title: "Минимум",
               value: `${tempMin}`,
               icon: "cold.png",
               },   
         }
   }
   push ()
   } catch(err) {
      console.log(err)
   }
   
}

const togglePopupClass = () => {
   popup.classList.toggle('active');
}


function push () {
   root.innerHTML = markup()
   const city = document.getElementById("city");
   city.addEventListener("click", togglePopupClass)
};

const handleInput = (e) => {
   store = {
      ...store,
      city: e.target.value
   }
}

const handleSubmit = (e) => {
   e.preventDefault();
   const value = store.city;
   if (!value) return null;
   localStorage.setItem('query',value)
   fetchData();
   togglePopupClass();
}

close.addEventListener('click', togglePopupClass);

formSubmit.addEventListener("submit", handleSubmit)
textInput.addEventListener('input', handleInput);

const getImage = (description) => {
   const value = description.toLowerCase();
   switch(value) {
      case "ясно":
         return "sunny.png";
      case "пасмурно":
         return "fog.png";
      case "небольшая облачность":
         return "cloud.png";
      default:
         return "clear.png";
   }
}

const renderProperty = (properties) => {
   return Object.values(properties).map(({title,value,icon}) => {
      return `<div class="property">
      <div class="property-icon">
         <img src="./img/icons/${icon}" alt="">
      </div>
      <div class="property-info">
         <div class="property-info__value">${value}</div>
         <div class="property-info__description">${title}</div>
      </div>
      </div>`
   }).join("");
   
}



const markup = () => {
   const {city,description, timeNow, temp,properties } = store;
   onlyHours = timeNow.split(":",1)
   
   const containerClass = onlyHours < 17 && onlyHours > 9 ? 'is-day' : "";
   return `
         <div class="weather__wrapper ${containerClass}">
            <div class="top-line">
               <div class="city" id="city">
                  <div class="city-subtitle">Погода сегодня в</div>
                  <div class="city-title">
                     <span>${city}</span>
                  </div>
               </div>
               <div class="city-info">
                  <div class="top-left">
                     <img src="./img/icons/${getImage(description)}" alt="" class="icon">
                     <div class="description">${description}</div>
                  </div>
                  <div class="top-right">
                  <div class="city-info__subtitle">${timeNow}</div>
                  <div class="city-info__title">${temp}°</div>
               </div>
               </div>
            </div>
            <div id="properties">${renderProperty(properties)}</div>
         </div>
   `
}

fetchData();

function correctTime (timezone) {
   let xhr = new XMLHttpRequest();
   xhr.open('GET', 'https://worldtimeapi.org/api/timezone/Europe/London', false); 
   xhr.send(); 
   if (xhr.status != 200) {
      console.log( xhr.status + ': ' + xhr.statusText ); 
   } else {
      let time = xhr.responseText; 
      let z = JSON.parse(time).utc_datetime; 
      let time1 = new Date(z).getTime();
      let newTime = time1 + ((timezone * 1000 - 3600000*3));
      if (new Date(newTime).getMinutes() < 10) {
         minutes = `0${new Date(newTime).getMinutes()}`
      } else {
         minutes = new Date(newTime).getMinutes();
      };
      if (new Date(newTime).getHours() < 10) {
         hours = `0${new Date(newTime).getHours()}`
      } else {
         hours = new Date(newTime).getHours();
      }
   }
   const correctTime = `${hours}:${minutes}`
   return correctTime
}


