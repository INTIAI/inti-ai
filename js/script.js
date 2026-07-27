"use strict";

/**
 * 🚀 INTI AI | MOTOR DE CIBERSEGURIDAD Y CONECTIVIDAD API
 * Arquitectura: Fetch API con JSON Payload hacia Webhook de Make.com.
 * Protección: Fallback automático a WhatsApp y Enrutamiento Bidireccional.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.info("🛡️ [INTI AI] Motor de Seguridad Iniciado.");

    const form = document.getElementById('form-auditoria');
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
    // ⚙️ CAPA 2: ENVÍO SEGURO Y ENRUTAMIENTO
    // ==========================================
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        errorContainer.style.display = 'none';

        // Detectar qué botón se presionó
        const submitter = e.submitter;
        const tipoContacto = submitter ? submitter.dataset.tipo : 'auditoria';

        // 1. Empaquetado Seguro
        const payload = {
            nombre: inputs.nombre.value.trim(),
            email: inputs.email.value.trim(),
            negocio: inputs.negocio.value.trim(),
            telefono: inputs.telefono.value.trim(),
            tipo_contacto: tipoContacto, 
            fecha: new Date().toISOString()
        };

        // 2. Validación
        if (payload.nombre.length < 3 || !payload.email.includes('@') || payload.telefono.length < 8) {
            return mostrarError("Por favor, completa todos los campos correctamente.");
        }

        // 3. Feedback Visual UI
        const textoOriginal = submitter.innerHTML;
        const btnAuditoria = document.getElementById('btn-auditoria');
        const btnWhatsapp = document.getElementById('btn-whatsapp');
        
        btnAuditoria.disabled = true;
        btnWhatsapp.disabled = true;
        submitter.innerHTML = `<span class="text-cyan-btn">ENVIANDO</span> <span class="text-gold-btn">SOLICITUD...</span>`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/mpg6y8j9jr5b21a0h7ygntao6cjwl3k9"; 

            const response = await fetch(MAKE_WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Respuesta no satisfactoria del servidor");

            console.info(`✅ Lead procesado vía [${tipoContacto.toUpperCase()}]`);

            // 4. Salto Dinámico
            ejecutarSaltoFinal(payload, tipoContacto);
            form.reset();

        } catch (error) {
            clearTimeout(timeoutId);
            console.warn("⚠️ Error en Webhook. Aplicando Fallback directo.");
            ejecutarSaltoFinal(payload, tipoContacto);
            form.reset();
        } finally {
            btnAuditoria.disabled = false;
            btnWhatsapp.disabled = false;
            submitter.innerHTML = textoOriginal;
        }
    });

    function mostrarError(mensaje) {
        errorContainer.innerHTML = `<strong>⚠️ Error:</strong> ${mensaje}`;
        errorContainer.style.display = 'block';
    }

    function ejecutarSaltoFinal(datos, tipo) {
        if (tipo === 'auditoria') {
            window.location.href = "https://calendar.app.google/zq22ThDPgpo4tq5r7";
        } else {
            const numeroWhatsApp = "549111526311635";
            const mensajeTexto = `¡Hola INTI AI! 🚀 Mi nombre es *${datos.nombre}* de *${datos.negocio}*. Quiero contactarme de forma directa para evaluar una solución.`;
            window.location.href = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeTexto)}`;
        }
    }
});