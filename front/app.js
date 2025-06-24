const API_STUDENT_URL = "http://localhost:5001/api/students";
const API_CAREERS_URL = 'http://localhost:5001/api/careers'
const API_CATEGORIES_URL = 'http://localhost:5001/api/categories'

const API_KEY = "12345ABCDEF";

// Headers comunes para todas las peticiones
const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
};

// se guarda(post) el nombre y carrera del estudiante esperando el fetch con la api y lo almacena en
// el .json
async function registerStudentService(name, career) {
    const response = await fetch(API_STUDENT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, career })
    });
    return response.json();
}

// esta función trae(get) el nombre del estudiante si se tiene el id
async function getStudentByIdService(id) {
    const response = await fetch(`${API_STUDENT_URL}/${id}`, {
        method: "GET",
        headers
    });
    return response.json();
}

// se elimina(delete) el estudiante por id
async function deleteStudentService(id) {
    const response = await fetch(`${API_STUDENT_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json();
}

// Función para registrar estudiante: mediante los id's que están en el formulario html (registerName y registerCareer)
// se registran nombre y carrera con la función registerStudent la cual es llamada en el botón del html
// luego, si ambos campos están completos la función espera a registerStudentService
// si sale bien se envía el mensaje de exito y se limpian los campos (try)
// en caso de que algo falle se ejecuta el catch para que el usuario tenga el feedback de que el registro
// no pudo realizarse
async function registerStudent() {
    const name = document.getElementById('registerName').value.trim();
    const career = document.getElementById('registerCareer').value.trim();
    const resultContainer = document.getElementById('registerResult');

    if (!name || !career) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese el nombre y seleccione una carrera"
        });
        return;
    }
    

    try {
        const result = await registerStudentService(name, career);

        Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "Estudiante registrado correctamente"
        });

        // Limpiar campos
        document.getElementById('registerName').value = '';
        document.getElementById('registerCareer').value = '';

        // Ocultar resultados previos si existían
        document.getElementById('registerResult').textContent = '';
        loadStudentsTable();

    } catch (error) {
        console.error("Error registering student:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo registrar el estudiante"
        });
    }
}

// Función para cargar las carreras en el desplegable: esta función primer espera a getAllCareersService
// para traer las carreras cargadas en la base, en el caso de que algo falle se ejecuta el catch y se envía
// el feedback al usuario para que sepa que no se cargaron las carreras.
async function populateCareerDropdown() {
    try {
        const careers = await getAllCareersService();
        const select = document.getElementById('registerCareer');

        // Limpiar opciones previas
        select.innerHTML = '<option value="">Seleccione una carrera</option>';

        // Agregar nuevas opciones
        careers.forEach(career => {
            const option = document.createElement('option');
            option.value = career.name;
            option.textContent = career.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar carreras:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar las carreras"
        });
    }
}

// Función para buscar un estudiante por id: se le pide al usuario el id númerico
// con getElementById y los id's studentId y getResult se busca y trae el resultado
// se llama a getStudentByIdService y se le muestra al usuario una
// ventana de "buscando..." si no se encuentra a el estudiante se muestra el error: no encontrado, si se
// encuentra al estudiante se muestra una tarjeta con los datos.
async function getStudentById() {
    const id = document.getElementById('studentId').value.trim();
    const resultContainer = document.getElementById('getResult');

    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un ID válido"
        });
        return;
    }

    try {
        // Mostrar loader mientras se busca
        Swal.fire({
            title: 'Buscando estudiante...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const student = await getStudentByIdService(id);
        
        // Cerrar el loader
        Swal.close();

        if (student.error || !student.id) {
            // Mostrar SweetAlert cuando no se encuentra el estudiante
            Swal.fire({
                icon: "error",
                title: "No encontrado",
                text: `No se encontró ningún estudiante con el ID ${id}`,
                confirmButtonText: 'Entendido'
            });
            resultContainer.textContent = ''; // Limpiar resultados anteriores
        } else {
            // Mostrar los datos del estudiante encontrado
            resultContainer.innerHTML = `
            <div class="info-card">
            <div class="info-card-title">Información del Estudiante</div>
            <div class="info-item">
                <strong>ID:</strong>
                <span>${student.id}</span>
            </div>
            <div class="info-item">
                <strong>Nombre:</strong>
                <span>${student.name}</span>
            </div>
            <div class="info-item">
                <strong>Carrera:</strong>
                <span>${student.career}</span>
            </div>
        </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching student:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al buscar el estudiante"
        });
        resultContainer.textContent = '';
    }
}

// Función para eliminar estudiante (por id), se pide el id con "deleteId" y si este es ingresado
// correctamente se espera al servicio deleteStudentService y se elimina (también está el try catch
// de los errores y las alertas etc etc)
async function deleteStudent() {
    const id = document.getElementById('deleteId').value.trim();

    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un ID válido"
        });
        return;
    }

    try {
        const result = await deleteStudentService(id);

        if (result.error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: result.error
            });
        } else {
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Estudiante eliminado correctamente"
            });
        }
        loadStudentsTable();

        document.getElementById('deleteId').value = '';
        document.getElementById('deleteResult').textContent = '';

    } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el estudiante"
        });
    }
}

// Función para eliminar estudiante desde la tabla: el id ya está en la tabla así que al usar el botón de
// eliminar se espera al servicio deleteStudentService, si sale bien re responde con exito si no el catch
// ejecuta el mensaje de error
async function deleteStudentById(id) {
    try {
        const result = await deleteStudentService(id);

        if (result.error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: result.error
            });
        } else {
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Estudiante eliminado correctamente"
            });
            loadStudentsTable();
        }
    } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el estudiante"
        });
    }
}
 
// servicios para carreras
// almacena(post) la información de la carrera (nombre e id) en el .json
async function registerCareerService(careerData) {
    const response = await fetch(API_CAREERS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(careerData)
    });
    return response.json();
}

// pide(get) la carrera solicitada por id
async function getCareerByIdService(id) {
    const response = await fetch(`${API_CAREERS_URL}/${id}`, {
        method: "GET",
        headers
    });
    return response.json();
}

// solicita(get) todas las carreras (para las tablas o los desplegables)
async function getAllCareersService() {
    const response = await fetch(API_CAREERS_URL, {
        method: "GET",
        headers
    });
    return response.json();
}

// elimina(delete) la carrera por id
async function deleteCareerService(id) {
    const response = await fetch(`${API_CAREERS_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json();
}

// se pide nombre, tipo y categoría
// si no se llenan todos los campos se muestra el error correspondiente (if)
// si se llenan correctamente se espera al servicio de registro y se registra en la api
// como en la api no están los datos de tipo y categoría (solo se registra nombre e id)
// el tipo y categoría se guarda localmente (PARA NO MODIFICAR LA API)
// se limpia el formulario y en el caso de error el catch envía el feedback
async function registerCareer() {
    const name = document.getElementById('careerName').value.trim();
    const type = document.getElementById('careerType').value;
    const category = document.getElementById('careerCategory').value;

    if (!name || !type || !category) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor complete todos los campos"
        });
        return;
    }

    try {
        const result = await registerCareerService({ name });
        
        if (result.error) {
            throw new Error(result.error);
        }

        // Guardar datos extendidos en localStorage
        const extraCareers = JSON.parse(localStorage.getItem('extraCareers') || '[]');
        
        // Eliminar entrada existente si hay duplicados
        const existingIndex = extraCareers.findIndex(e => e.name === name);
        if (existingIndex !== -1) {
            extraCareers.splice(existingIndex, 1);
        }
        
        extraCareers.push({ 
            name, 
            type, 
            category,
            id: result.id || Date.now() // Guardar también el ID si está disponible
        });
        
        localStorage.setItem('extraCareers', JSON.stringify(extraCareers));

        Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "Carrera registrada correctamente"
        });

        // Limpiar formulario
        document.getElementById('careerName').value = '';
        document.getElementById('careerType').value = '';
        document.getElementById('careerCategory').value = '';

        // Actualizar vistas
        loadCareersTable();
        populateCareerDropdown();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "No se pudo registrar la carrera"
        });
    }
}

// se pide el id válido, se muestra el mensaje de "buscando..." se espera al servicio de getCareerById
// y se muestran en una tarjeta junto con los datos guardados localmente
async function getCareerById() {
    const id = document.getElementById('careerId').value.trim();
    
    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un ID válido"
        });
        return;
    }

    try {
        // Mostrar loader
        Swal.fire({
            title: 'Buscando carrera...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Obtener datos de la API y localStorage
        const career = await getCareerByIdService(id);
        const extraCareers = JSON.parse(localStorage.getItem('extraCareers') || '[]');
        const extraData = extraCareers.find(e => e.name === career.name);
        
        // Cerrar loader
        Swal.close();

        if (career.error) {
            Swal.fire({
                icon: "error",
                title: "No encontrado",
                text: `No se encontró ninguna carrera con el ID ${id}`
            });
            return;
        }

        const resultContainer = document.getElementById('getCareerResult');
        resultContainer.innerHTML = `
        <div class="info-card">
        <div class="info-card-title">Información de la Carrera</div>
        <div class="info-item">
            <strong>ID:</strong>
            <span>${career.id}</span>
        </div>
        <div class="info-item">
            <strong>Nombre:</strong>
            <span>${career.name}</span>
        </div>
        <div class="info-item">
            <strong>Tipo:</strong>
            <span>${extraData?.type || 'No especificado'}</span>
        </div>
        <div class="info-item">
            <strong>Categoría:</strong>
            <span>${extraData?.category || 'No especificado'}</span>
        </div>
    </div>
        `;

    } catch (error) {
        console.error("Error al buscar carrera:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al buscar la carrera"
        });
    }
}

async function deleteCareer() {
    const id = document.getElementById('deleteCareerId').value.trim();
    
    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un ID válido"
        });
        return;
    }

    try {
        const result = await deleteCareerService(id);
        
        if (result.error) {
            document.getElementById('deleteResult').textContent = result.error;
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "Carrera eliminada correctamente"
        });

        // Limpiar campo y actualizar lista
        document.getElementById('deleteCareerId').value = '';
        document.getElementById('deleteResult').textContent = '';
        loadCareersTable();
        
    } catch (error) {
        console.error("Error al eliminar carrera:", error);
        document.getElementById('deleteResult').textContent = "Error al eliminar carrera";
    }
}

// función para cargar la tabla de carreras espera a la API con getAllCareersService y muestra
// los datos locales (tipo y categoría) y acá creo que el forEach es para que vaya uno por uno y cree
// una lista con los datos de la carrera
async function loadCareersTable() {
    try {
        const careers = await getAllCareersService();
        const extraCareers = JSON.parse(localStorage.getItem('extraCareers') || '[]');
        const tbody = document.getElementById('careersTableBody');
        tbody.innerHTML = '';

        careers.forEach(career => {
            const extra = extraCareers.find(e => e.name === career.name);
            const type = extra?.type || 'N/A';
            const category = extra?.category || 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${career.id}</td>
                <td>${career.name}</td>
                <td>${type}</td>
                <td>${category}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteCareerById(${career.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar carreras:", error);
        Swal.fire("Error", "No se pudieron cargar las carreras", "error");
    }
}

// función para eliminar carrera desde la tabla, recién me doy cuenta que no llamé a ningún servicio
// si no que hace fetch con la API directamente
async function deleteCareerById(id) {
    try {
        const response = await fetch(`${API_CAREERS_URL}/${id}`, {
            method: "DELETE",
            headers
        });
        const result = await response.json();
        
        if (result.error) {
            Swal.fire("Error", result.error, "error");
        } else {
            Swal.fire("Éxito", "Carrera eliminada", "success");
            loadCareersTable();
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire("Error", "No se pudo eliminar", "error");
    }
}

// agrega funcionalidad al botón y carga la tabla de carreras
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', (e) => {
         e.preventDefault();
         registerCareer();
     });
    
    document.querySelector('#deleteId').nextElementSibling.querySelector('button').addEventListener('click', deleteCareer);
    
    loadCareersTable();
});

// servicio para hacer post de la carrera en la api
async function registerCategoryService(name) {
    const response = await fetch(API_CATEGORIES_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ name })
    });

    const data = await response.json();
    
    // Manejo especial para la respuesta del backend actual
    if (response.status === 409) { // Conflicto (categoría ya existe)
        throw new Error(data.error);
    }
    
    if (!response.ok) { // Otros errores
        throw new Error('Error al registrar categoría');
    }
    
    // Éxito - forzar estructura esperada por el frontend
    return {
        id: data.category?.id || Date.now(), // Si no hay ID, usamos uno temporal
        name: data.category?.name || name,
        message: data.message
    };
}

// servicio para traer la categoría de la api con id
async function getCategoryByIdService(id) {
    const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
        method: "GET",
        headers
    });
    return response.json();
}

// servicio para traer todas las categorías
async function getAllCategoriesService() {
    const response = await fetch(API_CATEGORIES_URL, {
        method: "GET",
        headers
    });
    return response.json();
}

// servicio para eliminar la categoría por id
async function deleteCategoryService(id) {
    const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json();
}

// se registra la categoría con categoryName (tiene la opción de que solo se añadan letras, si no
// muestra error)
async function registerCategory(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('categoryName');
    const name = nameInput.value.trim();

    if (!name) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese el nombre de la categoría"
        });
        return;
    }

    // Validación para solo letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese solo letras en el nombre de la categoría"
        });
        return;
    }

    try {
        // Mostrar loader
        Swal.fire({
            title: 'Registrando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Hacer la petición
        const response = await fetch(API_CATEGORIES_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        // Cerrar loader
        Swal.close();

        if (!response.ok) {
            // Mostrar error específico del backend
            throw new Error(data.error || 'Error al registrar categoría');
        }

        // Mostrar éxito con mensaje del backend
        Swal.fire({
            icon: "success",
            title: "Éxito",
            text: data.message || "Categoría registrada correctamente"
        });

        // Limpiar y actualizar
        nameInput.value = '';
        loadCategoriesTable();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });
    }
}

async function getCategoryByIdService(id) {
    const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
        method: "GET",
        headers
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al buscar categoría');
    }
    
    return response.json();
}

// función para buscar la categoría por id, se espera al fetch con la api que devuelva la respuesta
// si no funciona el catch ejecuta el mensaje de error
async function getCategoryById() {
    const idInput = document.getElementById('searchCategoryIdInput');
    const id = idInput.value.trim();
    const resultContainer = document.getElementById('categoryResult');

    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un ID válido"
        });
        return;
    }

    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: "GET",
            headers
        });
        
        if (!response.ok) {
            throw new Error("Categoría no encontrada");
        }
        
        const category = await response.json();
        resultContainer.innerHTML = `
        <div class="info-card">
        <div class="info-card-title">Información de la Categoría</div>
        <div class="info-item">
            <strong>ID:</strong>
            <span>${category.id}</span>
        </div>
        <div class="info-item">
            <strong>Nombre:</strong>
            <span>${category.name}</span>
        </div>
    </div>
        `;
        
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se encontró ninguna categoría con ese ID"
        });
        resultContainer.textContent = '';
    }
}

async function deleteCategory() {
    const id = document.getElementById('deleteCategoryIdInput').value.trim();
    
    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un ID válido"
        });
        return;
    }

    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: "DELETE",
            headers
        });
        
        if (!response.ok) {
            throw new Error("No se pudo eliminar la categoría");
        }
        
        await response.json();
        
        Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "Categoría eliminada correctamente"
        });
        
        loadCategoriesTable();
        document.getElementById('deleteCategoryIdInput').value = '';
        
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No existe ninguna categoría con el ID proporcionado"
        });
    }
}

// función para cargar la tabla de categorías, espera el servicio para traer todas las categorías
async function loadCategoriesTable() {
    try {
        const categories = await getAllCategoriesService();
        const tbody = document.getElementById('categoriesTableBody');

        tbody.innerHTML = '';
        
        categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategoryById(${category.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
        Swal.fire("Error", "No se pudieron cargar las categorías", "error");
    }
}

// función para cargar el seleccionable de categorías en el registro de carreras
// llama al servicio para traer todas las categorías de la base
async function populateCategoryDropdown() {
    try {
        const categories = await getAllCategoriesService();
        const select = document.getElementById('careerCategory');

        // Limpiar opciones previas
        select.innerHTML = '<option value="">Seleccione una categoría</option>';

        // Agregar nuevas opciones
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name; // o category.id si usás ID en el backend
            option.textContent = category.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar categorías:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar las categorías"
        });
    }
}

// función para eliminar categorías desde la tabla, espera el fetch con la api y usa el metodo
// delete para eliminar
async function deleteCategoryById(id) {
    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: "DELETE",
            headers
        });
        const result = await response.json();
        
        if (result.error) {
            Swal.fire("Error", result.error, "error");
        } else {
            Swal.fire("Éxito", "Categoría eliminada", "success");
            loadCategoriesTable();
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire("Error", "No se pudo eliminar", "error");
    }
}

// función para cargar la tabla de estudiantes, espera al servicio de carreras para mostrar en que
// carrera está cada estudiante, hace un forEach para mostrar los elementos
async function loadStudentsTable() {
    try {
        const careers = await getAllCareersService();
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = '';

        for (const career of careers) {
            const students = await getStudentsByCareerService(career.name);
            
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.career}</td>
                    <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudentById(${student.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        Swal.fire("Error", "No se pudieron cargar los estudiantes", "error");
    }
}

// esto es para cargar las tablas según su respectiva página
document.addEventListener('DOMContentLoaded', () => {
    
    if (window.location.pathname.includes('carreras.html')) {
        loadCareersTable();
        populateCategoryDropdown();
    }

    if (window.location.pathname.includes('categorias.html')) {
        loadCategoriesTable();
    }

    if (window.location.pathname.includes('index.html')) {
        loadStudentsTable();
        populateCareerDropdown();
    }

    
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', registerCategory);
    }
});

// Conclusión: Los servicios sirven para hacer el fetch (la petición) a la API usando metodos: post (guardar
// get (traer) y delete (borrar)
// y luego usarlas en las funciones. Hay algunas cosas que me quedaron un poco mezcladas, por ejemplo
// en algunas funciones de categorías no usa los servicios y hay una función repetida
// pero prefiero entregar el trabajo primero para la primer corrección, tengo miedo de cambiar esas líneas
// de código ahora y que no funcione.
// después en las funciones resumidamente se da lo siguiente: con el html obtenemos los datos que quiere
// ingresar el usuario, estos tienen un ID: por ejemplo, el nombre del estudiante tiene el ID "registerName"
// con getElementById la función accede a el elemento (?) de ese ID por ejemplo Juan. Si la información está
// bien se llama al servicio correspondiente, en este caso registerStudentService, como este servicio usa el
// metodo POST lo que hace es GUARDAR ese elemento en el backend. Lo demás funciona igual.
// para buscar un elemento por id, el usuario agrega el id desde el html y en app.js se hace la petición
// con eel servicio el cual usa GET para TRAER el o los elemento/s de la base.
// para cargar las tablas también se usa el método GET para traer todos los elementos de una base especifica
// y para borrar se usa el metodo DELETE. en este archivo me faltó ordenar un poco el tema de los servicios
// después el if se usa como "si pasa x cosa..." por ejemplo que el usuario agrege un caracter incorrecto
// o no exista el elemento
// el try catch sirve para hacer algo (try) y si eso no funciona, hacer lo que está dentro del catch.

// NOTA: el app.js está bastante desorganizado, en el inicio.html me quedó css y me faltan correcciones
// porque los html quedaron chuecos y no los puedo comentar pero prefiero entregarlo así y tener la devolución completa