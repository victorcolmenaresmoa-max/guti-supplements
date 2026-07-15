GutiSupplements — flujo directo de pedidos
==========================================

CAMBIOS DE ESTA VERSIÓN
- Se eliminó completamente el carrito visible de la tienda.
- Cada producto abre su propia vista y permite solicitarlo directamente.
- Se retiró la sección inferior “Conoce el producto”.
- El formulario ahora solicita solamente datos esenciales.
- El pedido se guarda con un ID único y se procesa con LockService para soportar
  varios clientes al mismo tiempo sin mezclar solicitudes.
- El panel administrativo fue adaptado al nuevo formato de pedidos.
- El Apps Script agrega automáticamente las columnas faltantes en la hoja Pedidos.

ARCHIVOS IMPORTANTES
- google-apps-script/Codigo.gs: reemplazar en Google Apps Script.
- PASOS_DESPLIEGUE.txt: instrucciones completas de actualización.

No subas archivos .env con contraseñas o tokens al repositorio.
