"use strict";

/**
 * 🚀 INTI AI | MOTOR DE CIBERSEGURIDAD Y CONECTIVIDAD API (MVP ZERO-COST)
 * Arquitectura: Fetch API con JSON Payload hacia Webhook de Make.com.
 * Protección: Fallback automático a WhatsApp y Timeout Control.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.info("🛡️ [INTI AI] Motor de Seguridad Iniciado.");

    const form = document.getElementById('form-auditoria');
    const btnSubmit = document.getElementById('btn-submit');
    const errorContainer = document.getElementById('error-message');

    if (!form) return;

    const inputs = {
        nombre: document.getElementById('nombre'),
        email: document.getElementById('email'),
        negocio: document.getElementById('negocio'),
        telefono: document.getElementById('telefono')
    };

    // ==========================================
    // 🛡️ CAPA 1: SANITIZACIÓN EN TIEMPO REAL
    // ==========================================
    inputs.nombre.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
    inputs.negocio.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,&-]/g, '');
    });
    inputs.telefono.addEventListener('input', function() {
        this.value = this.value.replace(/[^\+0-9\s-]/g, '');
    });

    // ==========================================
    // ⚙️ CAPA 2: ENVÍO SEGURO (POST JSON)
    // ==========================================
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        errorContainer.style.display = 'none';

        // 1. Empaquetado Seguro de Datos
        const payload = {
            nombre: inputs.nombre.value.trim(),
            email: inputs.email.value.trim(),
            negocio: inputs.negocio.value.trim(),
            telefono: inputs.telefono.value.trim(),
            fecha: new Date().toISOString() // Formato de fecha estándar universal
        };

        // 2. Validación Básica
        if (payload.nombre.length < 3 || !payload.email.includes('@') || payload.telefono.length < 8) {
            return mostrarError("Por favor, completa todos los campos correctamente.");
        }

        // 3. Feedback Visual UI
        const textoOriginal = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="text-cyan-btn">ENVIANDO</span> <span class="text-gold-btn">SOLICITUD...</span>`;

        // Lógica de Timeout: Si Make.com no responde en 5 segundos, abortamos.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            // ✅ URL webhook 
            const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/mpg6y8j9jr5b21a0h7ygntao6cjwl3k9"; 

            // 4. Inyección a la Base de Datos (Petición POST pura)
            const response = await fetch(MAKE_WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal // Enlazamos el Timeout
            });

            clearTimeout(timeoutId); // Limpiamos el timer si la petición fue exitosa

            if (!response.ok) throw new Error("Respuesta no satisfactoria del servidor");

            console.info("✅ Lead procesado exitosamente en Make.com");

            // 5. Salto a WhatsApp y reseteo
            ejecutarSaltoWhatsApp(payload);
            form.reset();

        } catch (error) {
            clearTimeout(timeoutId);
            console.warn("⚠️ Error de conexión o Timeout. Aplicando protocolo Fallback a WhatsApp:", error);
            
            // Fallback: Si no hay internet o falla Make, redirigimos a WhatsApp para no perder el Lead
            ejecutarSaltoWhatsApp(payload);
            form.reset();
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    });

    function mostrarError(mensaje) {
        errorContainer.innerHTML = `<strong>⚠️ Error:</strong> ${mensaje}`;
        errorContainer.style.display = 'block';
    }

    function ejecutarSaltoWhatsApp(datos) {
        const numeroWhatsApp = "549111526311635";
        const mensajeTexto = `¡Hola INTI AI! 🚀 Mi nombre es *${datos.nombre}*. Solicito mi auditoría estratégica.\n\n📊 *Negocio:* ${datos.negocio}\n✉️ *Email:* ${datos.email}\n📞 *Tel:* ${datos.telefono}`;
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeTexto)}`;
        window.open(urlWhatsApp, '_blank');
    }
});