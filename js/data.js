// Mundos y lecciones. Para ampliar: añade lecciones en LESSONS[idMundo].
export const WORLDS = [
  { id: 1, name: 'FIRST STEPS', lvl: 'A1', desc: 'Saludos, alfabeto, números, días y meses' },
  { id: 2, name: 'VOCABULARY WORLD', lvl: 'A1', desc: 'Colores, animales, comida y objetos' },
  { id: 3, name: 'SENTENCE BUILDER', lvl: 'A2', desc: 'Verbo to be, artículos y oraciones' },
  { id: 4, name: 'DAILY LIFE', lvl: 'A2', desc: 'Familia, casa, rutinas y ciudad' },
  { id: 5, name: 'REAL WORLD', lvl: 'B1', desc: 'Restaurante, aeropuerto, hotel y ayuda' },
  { id: 6, name: 'CONVERSATION WORLD', lvl: 'B1', desc: 'Tiempos verbales y conversaciones' },
  { id: 7, name: 'ADVANCED ENGLISH', lvl: 'B2-C1', desc: 'Condicionales, voz pasiva y phrasal verbs' },
  { id: 8, name: 'PROFESSIONAL ENGLISH', lvl: 'C1-C2', desc: 'Entrevistas, reuniones y negociación' }
];
// w = "inglés|español;..."   s = oraciones para ordenar "inglés|español;..."
const L = (id, title, goal, w, s = '') => ({
  id, title, goal,
  words: w.split(';').map(x => x.split('|')),
  sents: s ? s.split(';').map(x => x.split('|')) : []
});
const NUM = 'One|Uno;Two|Dos;Three|Tres;Four|Cuatro;Five|Cinco;Six|Seis;Seven|Siete;Eight|Ocho;Nine|Nueve;Ten|Diez';
export const LESSONS = {
  1: [
    L('w1l1', 'Greetings', 'Saludar y despedirte', 'Hello|Hola;Good morning|Buenos días;Good afternoon|Buenas tardes;Good evening|Buenas noches (saludo);Good night|Buenas noches (despedida);Goodbye|Adiós;See you later|Hasta luego;Please|Por favor;Thank you|Gracias;Sorry|Lo siento', 'Good morning teacher|Buenos días profesor;See you later my friend|Hasta luego mi amigo'),
    L('w1l2', 'Introductions', 'Presentarte y decir de dónde eres', 'I|Yo;You|Tú;He|Él;She|Ella;We|Nosotros;They|Ellos;Nice to meet you|Mucho gusto;How are you|Cómo estás;I am fine|Estoy bien;What is your name|Cómo te llamas', 'My name is Alex|Mi nombre es Alex;I am from Mexico|Soy de México;I am ten years old|Tengo diez años;Nice to meet you too|Mucho gusto también'),
    L('w1l3', 'The Alphabet', 'Reconocer y deletrear letras', 'A|Letra A;B|Letra B;C|Letra C;D|Letra D;E|Letra E;F|Letra F;G|Letra G;H|Letra H;I|Letra I;J|Letra J'),
    L('w1l4', 'Numbers 1-10', 'Contar del 1 al 10', NUM, 'I have five apples|Tengo cinco manzanas'),
    L('w1l5', 'Days of the Week', 'Decir los días', 'Monday|Lunes;Tuesday|Martes;Wednesday|Miércoles;Thursday|Jueves;Friday|Viernes;Saturday|Sábado;Sunday|Domingo', 'Today is Monday|Hoy es lunes;I like Friday|Me gusta el viernes'),
    L('w1l6', 'Months of the Year', 'Decir los meses', 'January|Enero;February|Febrero;March|Marzo;April|Abril;May|Mayo;June|Junio;July|Julio;August|Agosto;September|Septiembre;October|Octubre;November|Noviembre;December|Diciembre', 'My birthday is in May|Mi cumpleaños es en mayo')
  ],
  2: [
    L('w2l1', 'Colors', 'Nombrar colores', 'Red|Rojo;Blue|Azul;Green|Verde;Yellow|Amarillo;Black|Negro;White|Blanco;Orange|Naranja;Pink|Rosa;Purple|Morado;Brown|Café', 'The sky is blue|El cielo es azul'),
    L('w2l2', 'Animals', 'Nombrar animales', 'Dog|Perro;Cat|Gato;Bird|Pájaro;Fish|Pez;Horse|Caballo;Lion|León;Elephant|Elefante;Monkey|Mono;Whale|Ballena;Shark|Tiburón', 'The cat is small|El gato es pequeño'),
    L('w2l3', 'Fruits', 'Nombrar frutas', 'Apple|Manzana;Banana|Plátano;Grape|Uva;Strawberry|Fresa;Watermelon|Sandía;Lemon|Limón;Pineapple|Piña;Mango|Mango', 'I eat an apple|Yo como una manzana')
  ]
};
