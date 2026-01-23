export function validateRun(run: string): boolean {
    if (!run) return false;
    // Clean format
    const cleanRun = run.replace(/[^0-9kK]/g, '');
    if (cleanRun.length < 8) return false;

    const body = cleanRun.slice(0, -1);
    const dv = cleanRun.slice(-1).toUpperCase();

    // Calculate DV
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const computedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

    return dv === computedDv;
}

export function formatRun(run: string): string {
    let val = run.replace(/[^0-9kK]/g, '');
    if (val.length > 1) {
        val = val.slice(0, -1) + '-' + val.slice(-1);
    }
    if (val.length > 5) {
        const parts = val.split('-');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        val = parts.join('-');
    }
    return val;
}

export function validatePhone(phone: string): boolean {
    // Expected format: +56 9 1234 5678 (with or without spaces)
    if (!phone) return false;
    const cleanPhone = phone.replace(/\s/g, '');
    return /^\+569\d{8}$/.test(cleanPhone);
}
