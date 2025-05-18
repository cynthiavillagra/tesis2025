import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

import re

def validate_user_data(text):
    # Listas de nombres y apellidos comunes
    nombres_comunes = [
        "María", "Juan", "José", "Ana", "Pedro", "Luis", "Marta", "Laura", "Carlos", "Lucía",
        "Francisco", "Carmen", "Javier", "Isabel", "Antonio", "Patricia", "Manuel", "Sofía",
        "Jesús", "Elena", "David", "Paula", "Miguel", "Sara", "Alejandro", "Andrea",
        "Daniel", "Claudia", "Fernando", "Raquel", "Ángel", "Silvia", "Ricardo", "Rosa",
        "Adrián", "Cristina", "Álvaro", "Beatriz", "Jorge", "Gloria", "Sergio", "Natalia",
        "Roberto", "Ramón", "Julia", "Diego", "Irene", "Samuel", "Alicia", "Óscar",
        "Pilar", "Raúl", "Verónica", "Hugo", "Sandra", "Alberto", "Eva", "Enrique",
        "Victoria", "Pablo", "Mónica", "Emilio", "Esther", "Eduardo", "Leticia", "Andrés",
        "Nuria", "Tomás", "Marina", "Ignacio", "Celia", "Sebastián", "Teresa", "Gabriel",
        "Lorena", "Santiago", "Elsa", "Guillermo", "Carolina", "Federico", "Jimena",
        "Gonzalo", "Lidia", "Mario", "Marisol", "Francisca", "Agustín", "Mateo", "Esteban",
        "Rafael", "Cecilia", "Rodrigo", "Manuela", "Felipe", "Camila", "Simón", "Noelia",
        "Martín", "Antonia", "Valentina", "Celeste", "Axel", "Nicolás", "Sol", "Alejandra",
        "Facundo", "Milagros", "Guadalupe", "Agustina", "Emilia", "Joaquín", "Catalina",
        "Renata", "Lautaro", "Julieta", "Thiago", "Gabriela", "Aitana", "Damián", "Emmanuel",
        "Belén", "Tomas", "Bruno", "Malena", "Miranda", "Maximiliano", "Julián", "Salvador",
        "Brenda", "Luisa", "Leandro", "Graciela", "Iván", "Florencia", "Matías", "Jazmín",
        "Elisa", "Rocío", "Federica", "Benjamín", "Micaela", "Celina", "Mariano", "Estela",
        "Ezequiel", "Guillermina", "Marcos", "Julio", "Emanuel", "Amparo", "Lucas",
        "Patricio", "Germán", "Solange", "Magdalena", "Jonatan", "Rebeca", "Joaquina", "Cristian",
        "Rosario", "Leonardo", "Lourdes", "Rodolfo", "Débora", "Juan Pablo", "Ana María",
        "María José", "María Laura", "José Luis", "Juan Carlos", "María Fernanda", "Luis Miguel",
        "José Antonio", "María Elena", "María Isabel", "Juan Manuel", "Juan José", "José Manuel",
        "José María", "Juan Andrés", "María Dolores", "José Ignacio", "María Eugenia", "José Ángel",
        "María Isabel", "Juan Pedro", "María Teresa", "José Ramón", "María Cristina", "María Paula",
        "María Esther", "José Francisco", "Juan Ramón", "Juan Francisco", "María Rosa", "Juan Sebastián",
        "María Angélica", "Juan Gabriel", "María Marta", "Juan David", "María Victoria", "Juan Antonio",
        "María Elena", "Juan José", "María Mercedes", "María Lucía", "Juan Martín", "María Graciela",
        "Juan Bautista", "María Alejandra", "Juan Ignacio", "María Gloria", "Juan Diego", "María Gabriela",
        "Juan Felipe", "María Belén", "Juan Manuel", "María Milagros", "Juan Pablo", "María Beatriz",
        # Más variantes y nombres de toda América Latina y España:
        "Diana", "Jacqueline", "Ivonne", "Esteban", "Ramiro", "Ángela", "Gema", "Yolanda", "Nuria",
        "Fabián", "Gustavo", "Omar", "Lisandro", "Bárbara", "Verónica", "Yamila", "Ariel", "Ramón",
        "Noemí", "Lidia", "Celina", "Dayana", "Micaela", "Aníbal", "Susana", "Ismael", "Araceli",
        "Ulises", "Yesica", "Celina", "Giuliana", "Camilo", "Delfina", "Zulema", "Brian", "Oscar",
        "Eduarda", "Silvio", "Leandro", "Dana", "Melisa", "Jazmín", "Paulo", "Karina", "Isaac",
        "Anabella", "Damián", "Pablo", "Paola", "Tomás", "Pamela", "Ignacio", "Sandra", "Erika",
        "Sol", "Sonia", "Martina", "Soledad", "León", "Alan", "Alma", "Andrea", "Alejo", "Elisa",
        "Guillermo", "Gonzalo", "Ailén", "Valeria", "Priscila", "Milena", "Maia", "Evelyn", "Yésica",
        "Nancy", "Bautista", "Mirta", "Constanza", "Ricardo", "Alfredo", "Orlando", "Clara",
        "Flavio", "Eugenio", "Estela", "Blanca", "Carina", "Olga", "Jonas", "Nadia", "Roberto",
        "Cintia", "Inés", "Selena", "Mariel", "Kevin", "Antonella", "Lautaro", "Mauricio",
        "Axel", "Fabiana", "Aldana", "Nélida", "Flor", "Hernán", "Valeria", "Vanesa", "Nicolás",
        "Agustin", "Ignacio", "Silvana", "Franco", "Florencia", "Lorena", "Julieta", "Estefanía",
        "Valentín", "Martín", "Maximiliano", "Emanuel", "Fermín", "Camilo", "Ciro", "Renzo",
        "León", "Brisa", "Mauro", "Jonatan", "Nazareno", "Joaquín", "Agustín", "Julián", "Dilan",
        "Guido", "Lucas", "Lucca", "Fausto", "Federico", "Enzo", "Ailén", "Aitana", "Ainhoa",
        "Aitana", "Alba", "Aldana", "Alex", "Alexander", "Alexis", "Alma", "Alonso", "Amaya",
        "Andrea", "Angel", "Antonella", "Antonio", "Araceli", "Ariadna", "Ariel", "Aurora",
        "Belén", "Benjamín", "Berta", "Bárbara", "Camila", "Candela", "Carla", "Carmen",
        "Catalina", "Cecilia", "Celeste", "Clara", "Claudia", "Concepción", "Constanza",
        "Cristina", "Daniel", "Daniela", "Dario", "David", "Débora", "Diego", "Domingo",
        "Edith", "Eduardo", "Elena", "Elisa", "Elizabeth", "Emilia", "Emiliano", "Emma",
        "Emmanuel", "Ernesto", "Esteban", "Estefanía", "Estela", "Eugenia", "Eva", "Fabiana",
        "Fabián", "Facundo", "Felipe", "Fernando", "Fermín", "Flor", "Florencia", "Francisco",
        "Gabriel", "Gabriela", "Gema", "Germán", "Gonzalo", "Graciela", "Guadalupe", "Guillermo",
        "Helena", "Hernán", "Hugo", "Ignacio", "Inés", "Irene", "Isabel", "Iván", "Jacobo",
        "Jaime", "Javier", "Joaquín", "Jorge", "José", "Josefina", "Juan", "Juana", "Judith",
        "Julia", "Juliana", "Julio", "Julián", "Justina", "Karen", "Karina", "Kevin", "Lara",
        "Laura", "Leandro", "Leonardo", "Lidia", "Lina", "Lorena", "Lourdes", "Lucía", "Luciana",
        "Luis", "Luisa", "Luz", "Magdalena", "Manuel", "Manuela", "Marcela", "Marcelo",
        "Marcos", "María", "Mariano", "Marina", "Mario", "Marta", "Martina", "Mateo", "Matías",
        "Maximiliano", "Melina", "Mercedes", "Micaela", "Miguel", "Miranda", "Miriam", "Mónica",
        "Nadia", "Natalia", "Nayara", "Nerea", "Nicolás", "Noelia", "Nuria", "Olga", "Oscar",
        "Pablo", "Pamela", "Patricia", "Paulina", "Pedro", "Pilar", "Raquel", "Raúl", "Renata",
        "Ricardo", "Rita", "Roberto", "Rodrigo", "Rosa", "Roxana", "Rubén", "Salvador", "Samuel",
        "Sandra", "Santiago", "Sara", "Sebastián", "Silvia", "Simón", "Sofía", "Sonia", "Susana",
        "Tamara", "Teresa", "Tomás", "Valentina", "Valeria", "Vanesa", "Verónica", "Vicente",
        "Victoria", "Violeta", "Virginia", "Yolanda", "Zoe"
    ]

    apellidos_comunes = [
        "García", "Pérez", "López", "González", "Rodríguez", "Martínez", "Sánchez", "Romero",
        "Díaz", "Álvarez", "Torres", "Ruiz", "Ramírez", "Fernández", "Flores", "Jiménez",
        "Moreno", "Muñoz", "Herrera", "Castro", "Ortiz", "Suárez", "Gutiérrez", "Silva",
        "Ramos", "Delgado", "Molina", "Aguilar", "Morales", "Vargas", "Castillo", "Cruz",
        "Rojas", "Méndez", "Reyes", "Chávez", "Vega", "Sosa", "Guerrero", "Medina",
        "Paredes", "Rivas", "Navarro", "Cabrera", "Ríos", "Serrano", "Santos", "Domínguez",
        "Peña", "Cortés", "Iglesias", "Campos", "Fuentes", "Espinoza", "Vázquez", "Correa",
        "León", "Guzmán", "Maldonado", "Carrasco", "Salazar", "Ponce", "Bravo", "Mejía",
        "Mora", "Montoya", "Acosta", "Reynoso", "Benítez", "Solís", "Rivera", "Rosales",
        "Luna", "Barrios", "Gallardo", "Pineda", "Arias", "Cardoso", "Escobar", "Quintero",
        "Padilla", "Palacios", "Robles", "Velázquez", "Nieto", "Cordero", "Sandoval",
        "Villanueva", "Figueroa", "Arroyo", "Valenzuela", "Carvajal", "Espinosa", "Estrada", "Salinas",
        "Del Valle", "San Martín", "De la Cruz", "De León", "De Jesús", "Del Río", "De los Santos",
        "Alonso", "Blanco", "Cano", "Domingo", "Esteban", "Gallego", "Giménez", "Herrero", "Lara",
        "Lozano", "Mendoza", "Mora", "Pascual", "Pastor", "Redondo", "Saez", "Valverde",
        "Soler", "Montes", "Nieto", "Ibáñez", "Vidal", "Rosales", "Bravo", "Peña",
        "De la Fuente", "Caballero", "Moya", "Plaza", "Sevilla", "Paredes", "Peralta",
        "Marín", "Lamas", "Reina", "Solano", "Durán", "Benito", "Beltrán", "Duarte",
        "Valle", "Barraza", "Villar", "Almeida", "Aponte", "Barreto", "Bermúdez", "Bolaños",
        "Borja", "Briceño", "Britos", "Cabral", "Calderón", "Cáceres", "Campos", "Cardona",
        "Carmona", "Carrera", "Castañeda", "Celis", "Cervantes", "Contreras", "Cuellar",
        "Del Castillo", "Del Carmen", "Del Monte", "Del Prado", "Del Toro", "Escalante",
        "Espitia", "Farfán", "Ferrer", "Franco", "Gallegos", "Godoy", "Huerta", "Ibáñez",
        "Landa", "Leal", "Macías", "Mancilla", "Márquez", "Mata", "Mella", "Menezes",
        "Mora", "Moreno", "Moscoso", "Muñiz", "Naranjo", "Navas", "Obregón", "Olivares",
        "Osorio", "Oviedo", "Páez", "Palma", "Pizarro", "Plascencia", "Portillo",
        "Prado", "Prieto", "Puga", "Quezada", "Quiñones", "Rendón", "Rincón", "Saavedra",
        "Salcedo", "Salgado", "Sanabria", "Santana", "Saucedo", "Segovia", "Serrato",
        "Sierra", "Soria", "Sotelo", "Tapia", "Tejada", "Tejeda", "Toledo", "Trejo",
        "Trujillo", "Ulloa", "Uribe", "Valdez", "Valero", "Varela", "Vargas", "Vera",
        "Vergara", "Villalobos", "Villalva", "Villalón", "Villalpando", "Villaseñor",
        "Zambrano", "Zapata", "Zarate", "Zavala"
    ]

    prompt = (
        "Extrae inteligentemente el NOMBRE COMPLETO (todos los nombres) y el APELLIDO COMPLETO (todos los apellidos) de la siguiente frase, separados por un espacio. "
        "Si detectas posibles errores de tipeo en el nombre o apellido, corrígelos y devuelve la versión corregida. "
        f"Prioriza nombres comunes ({', '.join(nombres_comunes[:20])}...) y apellidos comunes ({', '.join(apellidos_comunes[:20])}...). "
        "Si el nombre o apellido es similar a uno común pero tiene un error de tipeo, sugiere la corrección. "
        "Devuelve SOLO el nombre completo y el apellido completo corregidos, sin palabras adicionales, ni comillas. "
        "Si no puedes extraer ambos, sugiere la posible corrección en vez de 'NO EXTRAIDO'. Si no puedes sugerir, responde 'NO EXTRAIDO':\n" + text
    )
    client = openai.Client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Eres un asistente experto en extracción de datos de frases en español."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=10,
        temperature=0.0
    )
    resultado = response.choices[0].message.content.strip()
    # Si la IA no extrae, o el formato es incorrecto
    if resultado.lower() == "no extraido" or resultado.count(" ") != 1:
        return None, None
    # Detectar si hay corrección sugerida (si resultado es distinto al texto limpio)
    texto_limpio = re.sub(r'[^a-záéíóúüñ ]', '', text.lower())
    resultado_limpio = re.sub(r'[^a-záéíóúüñ ]', '', resultado.lower())
    if texto_limpio != resultado_limpio:
        # Sugerencia IA explícita: devolver nombre y apellido sugeridos
        nombre_sug, apellido_sug = resultado.split(" ", 1)
        return ('SUGERENCIA', nombre_sug.capitalize(), apellido_sug.capitalize())
    nombre, apellido = resultado.split(" ", 1)
    return nombre.capitalize(), apellido.capitalize()

