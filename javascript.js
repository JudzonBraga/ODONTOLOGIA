        // ===== VALIDACIÓN DE ADMIN CON CONTRASEÑA =====
        (function () {
            const ADMIN_PASSWORD = "CONTRASEÑA"; // Contraseña correcta
            let intentosFallidos = 0;
            let bloqueado = false;
            let tiempoDesbloqueo = null;
            const MAX_INTENTOS = 3;
            const TIEMPO_BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos

            const adminBtn = document.getElementById('adminBtn');
            const modal = document.getElementById('adminModal');
            const passwordInput = document.getElementById('adminPassword');
            const confirmBtn = document.getElementById('confirmAdmin');
            const cancelBtn = document.getElementById('cancelAdmin');
            const errorMsg = document.getElementById('modalError');

            let modoAdminActivo = false;

            function actualizarEstadoBotonAdmin() {
                if (bloqueado) {
                    adminBtn.classList.add('admin-blocked');
                } else {
                    adminBtn.classList.remove('admin-blocked');
                }
            }

            function mostrarModal() {
                if (bloqueado) {
                    const tiempoRestante = Math.ceil((tiempoDesbloqueo - Date.now()) / 1000 / 60);
                    errorMsg.textContent = `Demasiados intentos fallidos. Espera ${tiempoRestante} minutos para volver a intentar.`;
                    return;
                }
                passwordInput.value = '';
                errorMsg.textContent = '';
                modal.classList.add('active');
                passwordInput.focus();
            }

            function cerrarModal() {
                modal.classList.remove('active');
                passwordInput.value = '';
                errorMsg.textContent = '';
            }

            function verificarPassword() {
                if (bloqueado) return;

                const password = passwordInput.value.trim();

                if (password === ADMIN_PASSWORD) {
                    cerrarModal();
                    intentosFallidos = 0;
                    modoAdminActivo = true;
                    const mainContent = document.getElementById('mainContent');
                    const adminContainer = document.getElementById('adminContainer');
                    adminContainer.classList.add('visible');
                    mainContent.classList.add('hidden');
                } else {
                    intentosFallidos++;
                    const intentosRestantes = MAX_INTENTOS - intentosFallidos;

                    if (intentosFallidos >= MAX_INTENTOS) {
                        bloqueado = true;
                        tiempoDesbloqueo = Date.now() + TIEMPO_BLOQUEO_MS;
                        errorMsg.textContent = `Has superado el límite de ${MAX_INTENTOS} intentos. Acceso bloqueado por 5 minutos.`;
                        actualizarEstadoBotonAdmin();

                        setTimeout(() => {
                            bloqueado = false;
                            intentosFallidos = 0;
                            tiempoDesbloqueo = null;
                            actualizarEstadoBotonAdmin();
                            errorMsg.textContent = '';
                        }, TIEMPO_BLOQUEO_MS);

                        setTimeout(() => {
                            cerrarModal();
                        }, 2000);
                    } else {
                        errorMsg.textContent = `Contraseña incorrecta. Te quedan ${intentosRestantes} intento${intentosRestantes !== 1 ? 's' : ''}.`;
                        passwordInput.value = '';
                        passwordInput.focus();
                    }
                }
            }

            confirmBtn.addEventListener('click', verificarPassword);
            cancelBtn.addEventListener('click', cerrarModal);

            passwordInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    verificarPassword();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    cerrarModal();
                }
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cerrarModal();
                }
            });

            adminBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (modoAdminActivo) return;
                mostrarModal();
            });

            window.modoAdminActivo = modoAdminActivo;
            Object.defineProperty(window, 'modoAdminActivo', {
                get: () => modoAdminActivo,
                set: (val) => { modoAdminActivo = val; }
            });
        })();

        // ===== MENÚ ACORDEÓN PARA MÓVIL =====
        function initMobileMenu() {
            const logoContainer = document.querySelector('.logo-container');
            const navButtons = document.querySelector('.nav-buttons');
            const menuBar = document.querySelector('.menu-bar');

            function isMobile() {
                return window.innerWidth <= 425;
            }

            function toggleMenuIcon() {
                let menuIcon = document.querySelector('.menu-icon');

                if (isMobile()) {
                    if (!menuIcon) {
                        menuIcon = document.createElement('i');
                        menuIcon.className = 'fa-solid fa-bars menu-icon';
                        logoContainer.appendChild(menuIcon);
                        logoContainer.style.cursor = 'pointer';
                        logoContainer.addEventListener('click', function (e) {
                            e.stopPropagation();
                            navButtons.classList.toggle('active');
                            menuIcon.classList.toggle('active');
                        });
                    }
                    if (window.innerWidth <= 425) {
                        navButtons.classList.remove('active');
                        if (menuIcon) menuIcon.classList.remove('active');
                    }
                } else {
                    if (menuIcon) {
                        menuIcon.remove();
                    }
                    navButtons.classList.remove('active');
                    navButtons.style.display = '';
                }
            }

            toggleMenuIcon();
            window.addEventListener('resize', toggleMenuIcon);
        }

        document.addEventListener('DOMContentLoaded', initMobileMenu);

        // Navegación suave
        let modoAdminActivoGlobal = false;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const targetId = this.getAttribute('data-target');
                const mainContent = document.getElementById('mainContent');
                const adminContainer = document.getElementById('adminContainer');

                if (targetId === 'admin') {
                    return;
                }

                modoAdminActivoGlobal = window.modoAdminActivo || false;

                if (modoAdminActivoGlobal) {
                    modoAdminActivoGlobal = false;
                    window.modoAdminActivo = false;
                    adminContainer.classList.remove('visible');
                    mainContent.classList.remove('hidden');
                }

                if (targetId === 'inicio') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                const seccion = document.getElementById(targetId);
                if (seccion) {
                    const offset = 80;
                    const elementPosition = seccion.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            });
        });

        // ===== TECNOLOGÍA SLIDER =====
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicador-item');
        let currentSlide = 0;
        let progressIntervals = {};

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            indicators.forEach((indicator, i) => {
                indicator.classList.remove('active');
                const progressBar = indicator.querySelector('.indicador-progress');
                if (progressBar) progressBar.style.width = '0%';
                if (progressIntervals[i]) clearInterval(progressIntervals[i]);
            });
            indicators[index].classList.add('active');
            let progress = 0;
            const progressBar = indicators[index].querySelector('.indicador-progress');
            if (progressBar) {
                progressIntervals[index] = setInterval(() => {
                    progress += 1;
                    progressBar.style.width = progress + '%';
                    if (progress >= 100) {
                        clearInterval(progressIntervals[index]);
                        currentSlide = (currentSlide + 1) % slides.length;
                        showSlide(currentSlide);
                    }
                }, 50);
            }
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (progressIntervals[currentSlide]) clearInterval(progressIntervals[currentSlide]);
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        showSlide(0);

        window.addEventListener('beforeunload', () => {
            for (let i in progressIntervals) clearInterval(progressIntervals[i]);
        });

        // Mapa dinámico
        function actualizarMapa() {
            const select = document.getElementById('sede-select');
            const sede = select.value;
            const iframe = document.getElementById('mapa-iframe');
            const dirText = document.getElementById('direccion-texto');
            const mapas = {
                miraflores: { url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.972!2d-77.028685!3d-12.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b3e1234567%3A0x123456789abcdef!2sAv.%20Jos%C3%A9%20Pardo%20450%2C%20Miraflores!5e0", dir: "Av. José Pardo 450, Miraflores" },
                sanisidro: { url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.123!2d-77.045678!3d-12.098765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8f71234567%3A0x987654321!2sAv.%20Conquistadores%20350%2C%20San%20Isidro!5e0", dir: "Av. Conquistadores 350, San Isidro" },
                santiburgo: { url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.456!2d-76.998765!3d-12.145678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c7a31234567%3A0x1234567890!2sCaminos%20del%20Inca%20555%2C%20Surco!5e0", dir: "Caminos del Inca 555, Santiago de Surco" },
                larcomar: { url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.789!2d-77.037654!3d-12.134567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c85d1234567%3A0xabcdef123456789!2sLarcomar%2C%20Lima!5e0", dir: "Malecón de la Reserva 610, Miraflores" }
            };
            iframe.src = mapas[sede].url;
            dirText.innerHTML = `<i class="fa-regular fa-map"></i> ${mapas[sede].dir}`;
        }

        function actualizarTelefonoContacto() {
            const select = document.getElementById('contacto-sede-select');
            const sede = select.value;
            const telefonoBox = document.getElementById('contacto-telefono-info');
            const contactos = {
                '1': { telefono1: "+51 987 654 321", telefono2: "+51 987 654 322" },
                '2': { telefono1: "+51 987 654 323", telefono2: "+51 987 654 324" },
                '3': { telefono1: "+51 987 654 325", telefono2: "+51 987 654 326" },
                '4': { telefono1: "+51 987 654 327", telefono2: "+51 987 654 328" }
            };
            telefonoBox.innerHTML = `<p><i class="fa-solid fa-phone"></i> ${contactos[sede].telefono1}</p><p><i class="fa-solid fa-phone"></i> ${contactos[sede].telefono2}</p>`;
        }

        // ===== ADMIN SECTION =====
        const SPREADSHEET_ID = '1LRYE0MRCAAsC80ofL7pzLRZDNqqaRFeg1DLaDbFsVp8';
        const nombresSedeAdmin = { '1': 'Miraflores', '2': 'San Isidro', '3': 'Surco', '4': 'Larcomar' };
        let archivosPorSedeAdmin = { '1': [], '2': [], '3': [], '4': [] };
        let sedeActualAdmin = '1';

        function determinarTipoArchivoAdmin(url, nombre) {
            const urlLower = (url || '').toLowerCase();
            const nombreLower = (nombre || '').toLowerCase();
            if (urlLower.includes('presentation') || urlLower.includes('slide')) return 'powerpoint';
            if (urlLower.includes('spreadsheets') || urlLower.includes('sheet')) return 'excel';
            if (urlLower.includes('document') || urlLower.includes('doc')) return 'word';
            if (urlLower.includes('pdf') || urlLower.includes('file')) return 'pdf';
            if (nombreLower.includes('powerpoint') || nombreLower.includes('pptx')) return 'powerpoint';
            if (nombreLower.includes('excel') || nombreLower.includes('xlsx')) return 'excel';
            if (nombreLower.includes('word') || nombreLower.includes('docx')) return 'word';
            if (nombreLower.includes('pdf')) return 'pdf';
            return 'default';
        }

        function obtenerUrlGoogleAdmin(url, modo = 'vista') {
            if (!url) return url;
            const patrones = [
                { regex: /\/(?:presentation|document|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/, tipo: 'docs' },
                { regex: /\/file\/d\/([a-zA-Z0-9_-]+)/, tipo: 'drive' },
                { regex: /[?&]id=([a-zA-Z0-9_-]+)/, tipo: 'param' },
                { regex: /^([a-zA-Z0-9_-]{25,})$/, tipo: 'id' }
            ];
            let id = null;
            for (let patron of patrones) {
                const match = url.match(patron.regex);
                if (match) { id = match[1]; break; }
            }
            if (id) {
                let docType = 'file';
                if (url.includes('spreadsheets')) docType = 'spreadsheets';
                else if (url.includes('presentation')) docType = 'presentation';
                else if (url.includes('document')) docType = 'document';
                if (modo === 'vista') {
                    switch (docType) {
                        case 'spreadsheets': return `https://docs.google.com/spreadsheets/d/${id}/edit?usp=sharing`;
                        case 'presentation': return `https://docs.google.com/presentation/d/${id}/edit?usp=sharing`;
                        case 'document': return `https://docs.google.com/document/d/${id}/edit?usp=sharing`;
                        default: return `https://drive.google.com/file/d/${id}/preview`;
                    }
                } else {
                    switch (docType) {
                        case 'spreadsheets': return `https://docs.google.com/spreadsheets/d/${id}/edit`;
                        case 'presentation': return `https://docs.google.com/presentation/d/${id}/edit`;
                        case 'document': return `https://docs.google.com/document/d/${id}/edit`;
                        default: return `https://drive.google.com/file/d/${id}/view`;
                    }
                }
            }
            return url;
        }

        async function cargarDatosDesdeSheetAdmin() {
            for (let i = 1; i <= 4; i++) {
                const conteoElem = document.getElementById(`conteo-${i}`);
                if (conteoElem) conteoElem.textContent = 'Cargando...';
            }
            for (let sedeNum = 1; sedeNum <= 4; sedeNum++) {
                try {
                    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sede${sedeNum}`;
                    const response = await fetch(csvUrl);
                    const csvText = await response.text();
                    const lineas = csvText.split('\n');
                    archivosPorSedeAdmin[sedeNum.toString()] = [];
                    for (let i = 1; i < lineas.length; i++) {
                        const linea = lineas[i].trim();
                        if (linea) {
                            const columnas = [];
                            let enComillas = false, colActual = '';
                            for (let char of linea) {
                                if (char === '"') enComillas = !enComillas;
                                else if (char === ',' && !enComillas) { columnas.push(colActual); colActual = ''; }
                                else colActual += char;
                            }
                            columnas.push(colActual);
                            const nombre = (columnas[0] || '').replace(/^"|"$/g, '').trim();
                            const url = (columnas[1] || '').replace(/^"|"$/g, '').trim();
                            if (nombre && url) {
                                const tipo = determinarTipoArchivoAdmin(url, nombre);
                                archivosPorSedeAdmin[sedeNum.toString()].push({ nombre, url, tipo });
                            }
                        }
                    }
                    const conteoElem = document.getElementById(`conteo-${sedeNum}`);
                    if (conteoElem) conteoElem.textContent = `${archivosPorSedeAdmin[sedeNum.toString()].length} archivos`;
                } catch (error) {
                    console.error(`Error cargando sede ${sedeNum}:`, error);
                    const conteoElem = document.getElementById(`conteo-${sedeNum}`);
                    if (conteoElem) conteoElem.textContent = 'Error';
                    if (archivosPorSedeAdmin[sedeNum.toString()].length === 0) {
                        archivosPorSedeAdmin[sedeNum.toString()] = [
                            { nombre: `Documento Ejemplo ${sedeNum}`, url: 'https://docs.google.com/spreadsheets/d/1ghh_KgNyxOSLGgkvBNensNBCTg5kYjAgY9YDEGN47Og/edit?usp=sharing', tipo: 'excel' },
                            { nombre: `Presentación ${sedeNum}`, url: 'https://docs.google.com/presentation/d/1NVxmVZPWE3L-Vj0eu4dh8CYK3Yd8yPyx/edit?usp=sharing', tipo: 'powerpoint' }
                        ];
                        if (conteoElem) conteoElem.textContent = `${archivosPorSedeAdmin[sedeNum.toString()].length} archivos`;
                    }
                }
            }
            seleccionarSedeAdmin(sedeActualAdmin);
        }

        function seleccionarSedeAdmin(sede) {
            sedeActualAdmin = sede;
            document.querySelectorAll('.carpeta').forEach(c => {
                c.classList.remove('seleccionada');
                if (c.dataset.sede === sede) c.classList.add('seleccionada');
            });
            const nombreElem = document.getElementById('sede-nombre-admin');
            const tagElem = document.getElementById('sede-tag-admin');
            if (nombreElem) nombreElem.textContent = nombresSedeAdmin[sede];
            if (tagElem) tagElem.innerHTML = `📍 Sede ${nombresSedeAdmin[sede]}`;
            cargarArchivosAdmin(sede);
            cerrarVisorAdmin();
        }

        function cargarArchivosAdmin(sede) {
            const grid = document.getElementById('archivos-grid-admin');
            const archivos = archivosPorSedeAdmin[sede] || [];
            if (!grid) return;
            if (archivos.length === 0) {
                grid.innerHTML = `<div class="loading"><i class="fa-regular fa-folder-open"></i><p>No hay documentos en esta sede</p></div>`;
                return;
            }
            let html = '';
            archivos.forEach((archivo) => {
                const icono = { excel: 'fa-file-excel', word: 'fa-file-word', powerpoint: 'fa-file-powerpoint', pdf: 'fa-file-pdf', default: 'fa-file-lines' }[archivo.tipo] || 'fa-file-lines';
                html += `<div class="archivo-item" onclick="abrirDocumentoAdmin('${archivo.url}', '${archivo.nombre}', '${archivo.tipo}')">
                    <div class="archivo-icono"><i class="fa-regular ${icono}"></i><h4>${archivo.nombre}</h4><p>${archivo.tipo.toUpperCase()}</p></div>
                    <div class="acciones-archivo"><button class="btn-accion btn-externo" onclick="event.stopPropagation(); window.open('${obtenerUrlGoogleAdmin(archivo.url, 'edicion')}', '_blank')"><i class="fa-solid fa-external-link-alt"></i> Editar</button></div>
                </div>`;
            });
            grid.innerHTML = html;
        }

        function abrirDocumentoAdmin(url, titulo, tipo) {
            const visor = document.getElementById('visor-documento-admin');
            const iframe = document.getElementById('visor-frame-admin');
            const tituloEl = document.getElementById('documento-titulo-admin');
            const iconoEl = document.getElementById('visor-icono-admin');
            const iconos = { excel: 'fa-file-excel', word: 'fa-file-word', powerpoint: 'fa-file-powerpoint', pdf: 'fa-file-pdf', default: 'fa-file-lines' };
            if (iconoEl) iconoEl.className = `fa-regular ${iconos[tipo] || iconos.default}`;
            if (tituloEl) tituloEl.textContent = titulo;
            if (iframe) iframe.src = obtenerUrlGoogleAdmin(url, 'vista');
            if (visor) visor.classList.add('mostrar');
            if (visor) visor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function cerrarVisorAdmin() {
            const visor = document.getElementById('visor-documento-admin');
            const iframe = document.getElementById('visor-frame-admin');
            if (visor) visor.classList.remove('mostrar');
            if (iframe) iframe.src = '';
        }

        window.seleccionarSedeAdmin = seleccionarSedeAdmin;
        window.abrirDocumentoAdmin = abrirDocumentoAdmin;
        window.cerrarVisorAdmin = cerrarVisorAdmin;
        window.obtenerUrlGoogleAdmin = obtenerUrlGoogleAdmin;

        window.addEventListener('load', () => { cargarDatosDesdeSheetAdmin(); });

        // ===== NUEVA SECCIÓN ESPECIALISTAS 3D =====
        const nodes3d = [].slice.call(document.querySelectorAll('#especialistasList3D li'), 0);
        const directions3d = { 0: 'top', 1: 'right', 2: 'bottom', 3: 'left' };
        const classNames3d = ['in', 'out'].map(p => Object.values(directions3d).map(d => `${p}-${d}`)).reduce((a, b) => a.concat(b));

        const getDirectionKey3d = (ev, node) => {
            const { width, height, top, left } = node.getBoundingClientRect();
            const l = ev.pageX - (left + window.pageXOffset);
            const t = ev.pageY - (top + window.pageYOffset);
            const x = l - width / 2 * (width > height ? height / width : 1);
            const y = t - height / 2 * (height > width ? width / height : 1);
            return Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
        };

        class Item3d {
            constructor(element) {
                this.element = element;
                this.element.addEventListener('mouseenter', ev => this.update(ev, 'in'));
                this.element.addEventListener('mouseleave', ev => this.update(ev, 'out'));
            }
            update(ev, prefix) {
                this.element.classList.remove(...classNames3d);
                this.element.classList.add(`${prefix}-${directions3d[getDirectionKey3d(ev, this.element)]}`);
            }
        }
        nodes3d.forEach(node => new Item3d(node));

        // ===== EFECTOS DE ENTRADA CON SCROLL (REVEAL ON SCROLL) =====
        const observerOptions = {
            threshold: 0.15, // Se activa cuando el 15% del elemento es visible
            rootMargin: '0px 0px -50px 0px' // Pequeño offset
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target); // Deja de observar después de activar
                }
            });
        }, observerOptions);

        // Elementos a observar
        const animatedElements = document.querySelectorAll('.servicio-card, .especialistas-grid-3d li, .indicador-item, .footer-col, .carpeta, .archivo-item');

        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused'; // Pausar animación inicialmente
            observer.observe(el);
        });
    
