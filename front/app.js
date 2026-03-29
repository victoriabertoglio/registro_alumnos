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

// función para traer esudiantes por carrera así puede cargarse la tabla. Utiliza el método GET y le pide
// a la API los estudiantes
async function getStudentsByCareerService(careerName) {
    const response = await fetch(`${API_STUDENT_URL}?career=${encodeURIComponent(careerName)}`, {
        method: "GET",
        headers
    });

    if (!response.ok) {
        throw new Error("No se pudieron obtener los estudiantes por carrera");
    }

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
    const select = document.getElementById('registerCareer');
    if (!select) return; // 🚨 Previene el error en páginas donde no existe

    try {
        const careers = await getAllCareersService();

        select.innerHTML = '<option value="">Seleccione una carrera</option>';
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

        // Guardar datos extendidos en localStorage usando el ID de la API
        const extraCareers = JSON.parse(localStorage.getItem('extraCareers') || '[]');
        
        // Eliminar entrada existente si hay duplicados (por nombre)
        const existingIndex = extraCareers.findIndex(e => e.name.toLowerCase() === name.toLowerCase());
        if (existingIndex !== -1) {
            extraCareers.splice(existingIndex, 1);
        }
        
        // Usar siempre el ID de la API para consistencia
        extraCareers.push({ 
            id: result.career.id, // Usar el ID de la respuesta de la API
            name, 
            type, 
            category
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
        // Mostrar loader
        const tbody = document.getElementById('careersTableBody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

        // Obtener datos en paralelo
        const [careers, extraCareers] = await Promise.all([
            getAllCareersService(),
            JSON.parse(localStorage.getItem('extraCareers')) || '[]'
        ]);

        // Limpiar tabla
        tbody.innerHTML = '';

        if (careers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay carreras registradas</td></tr>';
            return;
        }

        // Llenar tabla
        careers.forEach(career => {
            // Buscar datos extendidos por ID primero, luego por nombre como fallback
            let extraData = extraCareers.find(e => e.id === career.id);
            if (!extraData) {
                extraData = extraCareers.find(e => e.name.toLowerCase() === career.name.toLowerCase()) || {};
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${career.id}</td>
                <td>${career.name}</td>
                <td>${extraData.type || 'N/A'}</td>
                <td>${extraData.category || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-danger" onclick="deleteCareerById(${career.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error cargando carreras:", error);
        const tbody = document.getElementById('careersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center error">
                    Error al cargar las carreras. Intente recargar la página.
                </td>
            </tr>
        `;
        Swal.fire("Error", "No se pudieron cargar las carreras", "error");
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
        const select = document.getElementById('careerCategory');
        if (!select) return;

        // Mostrar estado de carga
        select.innerHTML = '<option value="">Cargando categorías...</option>';

        // Obtener categorías
        const categories = await getAllCategoriesService();

        // Limpiar y poblar el dropdown
        select.innerHTML = '<option value="">Seleccione una categoría</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando categorías:", error);
        const select = document.getElementById('careerCategory');
        if (select) {
            select.innerHTML = '<option value="">Error al cargar categorías</option>';
        }
        Swal.fire("Error", "No se pudieron cargar las categorías", "error");
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

//función para editar estudiante: para que funcione sin modificar la API, se elimina el estudiante viejo
// y se guarda el nuevo con los datos modificados
async function editStudent(id) {
    try {
        const student = await getStudentByIdService(id);
        const allCareers = await getAllCareersService();

        if (!student || !student.id) {
            return Swal.fire("Error", "Estudiante no encontrado", "error");
        }

        // Generar opciones del select
        const careerOptions = allCareers.map(c => `
            <option value="${c.name}" ${c.name === student.career ? 'selected' : ''}>${c.name}</option>
        `).join('');

        // Tomar el template desde el HTML
        const template = document.getElementById('editStudentTemplate');
        const clonedHtml = template.innerHTML;

        // Mostrar modal
        const { value: formValues } = await Swal.fire({
            title: 'Editar Estudiante',
            html: clonedHtml,
            customClass: {
                popup: 'swal2-custom-modal'
            },
            showCloseButton: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            focusConfirm: false,
            didOpen: () => {
                document.getElementById('swalName').value = student.name;
                const select = document.getElementById('swalCareer');
                select.innerHTML = careerOptions;
            },
            preConfirm: () => {
                const name = document.getElementById('swalName').value.trim();
                const career = document.getElementById('swalCareer').value;
                if (!name || !career) {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                    return false;
                }
                return { name, career };
            }
        });

        if (!formValues) return;

        // Simular edición: eliminar y volver a registrar
        await deleteStudentService(id);
        await registerStudentService(formValues.name, formValues.career);

        Swal.fire("Éxito", "Estudiante editado correctamente", "success");
        loadStudentsTable();

    } catch (error) {
        console.error("Error al editar estudiante:", error);
        Swal.fire("Error", "No se pudo editar el estudiante", "error");
    }
}


// esto es para cargar las tablas según su respectiva página, "addEventListener" lo que hace es "escuchar"
// a que página entra el usuario, según a cual entre con getElemtById trae el formulario y los datos
// corespondientes. En esta parte también se populan los seleccionables de carreras y estudiantes.
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Página de carreras
    if (path.includes('carreras.html')) {
        const form = document.getElementById('careerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                registerCareer();
            });
        }
        loadCareersTable();
        populateCategoryDropdown();
    }

    // Página de categorías
    if (path.includes('categorias.html')) {
        loadCategoriesTable();

        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', registerCategory);
        }
    }

    // Página de estudiantes
    if (path.includes('index.html')) {
        loadStudentsTable();
        populateCareerDropdown();
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