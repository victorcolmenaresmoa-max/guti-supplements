/**
 * ============================================================
 *  VITRINA DEL HERO  (carrusel infinito de botes)
 * ============================================================
 *
 *  Esta lista es INTENCIONALMENTE estática y local.
 *
 *  ¿Por qué no se lee del catálogo (Google Sheets / API)?
 *  Porque el catálogo llega por fetch DESPUÉS de que la página
 *  se pinta. Mientras llega, el navegador ni siquiera sabe qué
 *  imágenes pedir → hueco vacío y parpadeo al entrar.
 *
 *  Al ser rutas locales fijas, las etiquetas <img> ya vienen
 *  escritas en el HTML inicial y el navegador empieza a
 *  descargarlas en el primer milisegundo. Cero espera, cero
 *  parpadeo.
 *
 *  ------------------------------------------------------------
 *  CÓMO AGREGAR O CAMBIAR UN BOTE
 *  ------------------------------------------------------------
 *  1. Guarda la foto en:  public/catalogo/
 *  2. Nombre en minúsculas, sin espacios ni acentos.
 *     Ej: creatina-sp-nutrition.webp
 *  3. Agrega una línea aquí abajo con su ruta, su texto alt y
 *     el tamaño REAL en píxeles del archivo exportado.
 *
 *  El tamaño real es obligatorio: es lo que evita que el bloque
 *  "salte" mientras la imagen carga (layout shift).
 * ============================================================
 */

export interface ShowcaseItem {
  /** Ruta dentro de /public. Siempre empieza con "/". */
  src: string;
  /** Descripción para lectores de pantalla y SEO. */
  alt: string;
  /** Ancho real del archivo exportado, en píxeles. */
  width: number;
  /** Alto real del archivo exportado, en píxeles. */
  height: number;
}

/**
 * Recomendado: entre 6 y 12 botes. Con 9 quedan 3 por columna,
 * que es la cantidad justa para que el bucle se vea continuo.
 *
 * ⚠️ Las rutas de abajo son de ejemplo. Reemplázalas por tus
 * archivos reales siguiendo la guía GUIA-IMAGENES.md.
 */
export const HERO_SHOWCASE: ShowcaseItem[] = [
  { src: '/catalogo/creatina-monohidratada.webp', alt: 'Creatina monohidratada micronizada', width: 360, height: 480 },
  { src: '/catalogo/whey-protein-isolate.webp', alt: 'Whey protein isolate', width: 360, height: 480 },
  { src: '/catalogo/mass-gainer.webp', alt: 'Mass gainer fórmula balanceada', width: 360, height: 480 },
  { src: '/catalogo/pre-entreno.webp', alt: 'Pre-entreno en polvo', width: 360, height: 480 },
  { src: '/catalogo/bcaa.webp', alt: 'BCAA aminoácidos ramificados', width: 360, height: 480 },
  { src: '/catalogo/omega-3.webp', alt: 'Omega 3 en cápsulas blandas', width: 360, height: 480 },
  { src: '/catalogo/multivitaminico.webp', alt: 'Multivitamínico diario', width: 360, height: 480 },
  { src: '/catalogo/glutamina.webp', alt: 'Glutamina en polvo', width: 360, height: 480 },
  { src: '/catalogo/colageno.webp', alt: 'Colágeno hidrolizado', width: 360, height: 480 },
];
