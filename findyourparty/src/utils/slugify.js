export function slugify(text) {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres unicode (ej. "é" -> "e")
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .toLowerCase() // Convierte a minúsculas
    .trim() // Elimina espacios en blanco al principio y al final
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/[^\w-]+/g, ''); // Elimina caracteres no alfanuméricos excepto guiones
}