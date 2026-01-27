export function formatRut(rut: string): string {
    // Remove non-alphanumeric characters
    const cleanRut = rut.replace(/[^0-9kK]/g, "");

    // Limit to 9 characters (8 digits + 1 check digit)
    if (cleanRut.length > 9) {
        return cleanRut.slice(0, 9); // Or handle as you see fit
    }

    if (cleanRut.length <= 1) return cleanRut;

    // Separate body and dv
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Format body with dots
    let formattedBody = "";
    for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
        if (j > 0 && j % 3 === 0) {
            formattedBody = "." + formattedBody;
        }
        formattedBody = body[i] + formattedBody;
    }

    return `${formattedBody}-${dv}`;
}

export function validateRut(rut: string): boolean {
    if (!rut) return false;

    const cleanRut = rut.replace(/[^0-9kK]/g, "");
    if (cleanRut.length < 2) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    if (!/^\d+$/.test(body)) return false;

    let suma = 0;
    let multiplo = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        suma += parseInt(body[i]) * multiplo;
        if (multiplo < 7) multiplo += 1;
        else multiplo = 2;
    }

    const dvEsperado = 11 - (suma % 11);

    let dvCalculado = "";
    if (dvEsperado === 11) dvCalculado = "0";
    else if (dvEsperado === 10) dvCalculado = "K";
    else dvCalculado = dvEsperado.toString();

    return dv === dvCalculado;
}

export function formatPhone(phone: string): string {
    // Keep only numbers
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if it starts with 56 (Chile code), if so remove it for internal storage/logic if needed,
    // but the user wants to SEE +56.
    // Let's assume the user inputs only the 9 digits, and we prepend +56.

    // If the string is already long (e.g., contains 569...), we might need to be smarter.
    // For this specific inputs: "User types numbers", "System adds +56".

    // We will handle the display logic in the component, here we can just ensure it's digits.
    return cleanPhone;
}
